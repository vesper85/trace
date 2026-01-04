#!/usr/bin/env tsx
/**
 * Script to decode BCS-encoded delta.json from aptos-sim sessions
 * 
 * The delta.json contains resource group data in the format:
 * {
 *   "resource_group::<address>::<module>::<struct>": "<hex_encoded_bcs_data>"
 * }
 * 
 * Each resource group contains multiple resources packed together using BCS serialization.
 * 
 * Usage: npx tsx decode-delta.ts <path-to-delta.json>
 */

import * as fs from 'fs';

// Simple BCS Deserializer implementation
class BCSDeserializer {
    private buffer: Uint8Array;
    private offset: number = 0;

    constructor(data: Uint8Array) {
        this.buffer = data;
    }

    deserializeU8(): number {
        const value = this.buffer[this.offset]!;
        this.offset += 1;
        return value;
    }

    deserializeU64(): bigint {
        const bytes = this.buffer.slice(this.offset, this.offset + 8);
        this.offset += 8;
        // Little-endian
        let value = BigInt(0);
        for (let i = 7; i >= 0; i--) {
            value = value * BigInt(256) + BigInt(bytes[i]!);
        }
        return value;
    }

    deserializeBool(): boolean {
        return this.deserializeU8() !== 0;
    }

    deserializeFixedBytes(len: number): Uint8Array {
        const bytes = this.buffer.slice(this.offset, this.offset + len);
        this.offset += len;
        return bytes;
    }

    deserializeULEB128(): number {
        let value = 0;
        let shift = 0;
        while (this.offset < this.buffer.length) {
            const byte = this.buffer[this.offset]!;
            this.offset++;
            value |= (byte & 0x7f) << shift;
            if ((byte & 0x80) === 0) break;
            shift += 7;
        }
        return value;
    }

    position(): number {
        return this.offset;
    }

    remaining(): number {
        return this.buffer.length - this.offset;
    }
}

interface ResourceGroupEntry {
    resourceType: string;
    data: Uint8Array;
    decodedHex: string;
}

interface DecodedResourceGroup {
    address: string;
    groupType: string;
    entries: ResourceGroupEntry[];
    rawHex: string;
}

function hexToBytes(hex: string): Uint8Array {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function parseResourceType(bytes: Uint8Array, offset: number): { type: string; bytesRead: number } {
    // Resource types in BCS are typically encoded as:
    // - address (32 bytes)
    // - module name (length-prefixed string)
    // - struct name (length-prefixed string)

    let pos = offset;

    // Read address (32 bytes)
    const address = '0x' + bytesToHex(bytes.slice(pos, pos + 32));
    pos += 32;

    // Read module name (ULEB128 length + string)
    const moduleLen = bytes[pos]!;
    pos += 1;
    const moduleName = new TextDecoder().decode(bytes.slice(pos, pos + moduleLen));
    pos += moduleLen;

    // Read struct name (ULEB128 length + string)
    const structLen = bytes[pos]!;
    pos += 1;
    const structName = new TextDecoder().decode(bytes.slice(pos, pos + structLen));
    pos += structLen;

    return {
        type: `${address}::${moduleName}::${structName}`,
        bytesRead: pos - offset
    };
}

function decodeResourceGroup(key: string, hexData: string): DecodedResourceGroup {
    // Parse key: "resource_group::<address>::<module>::<struct>"
    const parts = key.split('::');
    const address = parts[1] || '';
    const groupType = parts.slice(2).join('::');

    const bytes = hexToBytes(hexData);
    const entries: ResourceGroupEntry[] = [];

    console.log(`\n--- Decoding Resource Group ---`);
    console.log(`Address: ${address}`);
    console.log(`Group Type: ${groupType}`);
    console.log(`Total bytes: ${bytes.length}`);
    console.log(`Raw hex: ${hexData.substring(0, 100)}...`);

    // Resource group format in BCS:
    // - First byte(s): ULEB128 count of resources
    // - Then for each resource:
    //   - Resource type (address + module + struct)
    //   - ULEB128 length of data
    //   - Resource data bytes

    let pos = 0;

    // Read resource count (ULEB128)
    let resourceCount = 0;
    let shift = 0;
    while (pos < bytes.length) {
        const byte = bytes[pos]!;
        resourceCount |= (byte & 0x7f) << shift;
        pos++;
        if ((byte & 0x80) === 0) break;
        shift += 7;
    }

    console.log(`\nResource count: ${resourceCount}`);

    // Read each resource entry
    for (let i = 0; i < resourceCount && pos < bytes.length; i++) {
        console.log(`\n  --- Entry ${i + 1} ---`);
        console.log(`  Position: ${pos}`);

        // Parse resource type
        const { type, bytesRead } = parseResourceType(bytes, pos);
        pos += bytesRead;
        console.log(`  Resource Type: ${type}`);

        // Read data length (ULEB128)
        let dataLen = 0;
        shift = 0;
        while (pos < bytes.length) {
            const byte = bytes[pos]!;
            dataLen |= (byte & 0x7f) << shift;
            pos++;
            if ((byte & 0x80) === 0) break;
            shift += 7;
        }
        console.log(`  Data length: ${dataLen}`);

        // Read data
        const data = bytes.slice(pos, pos + dataLen);
        pos += dataLen;

        const decodedHex = '0x' + bytesToHex(data);
        console.log(`  Data (hex): ${decodedHex.substring(0, 100)}${decodedHex.length > 100 ? '...' : ''}`);

        // Try to decode known types
        if (type.includes('ObjectCore')) {
            decodeObjectCore(data);
        } else if (type.includes('FungibleStore')) {
            decodeFungibleStore(data);
        }

        entries.push({
            resourceType: type,
            data,
            decodedHex
        });
    }

    return {
        address,
        groupType,
        entries,
        rawHex: hexData
    };
}

function decodeObjectCore(data: Uint8Array) {
    console.log(`\n    --- ObjectCore Decode ---`);
    try {
        const deserializer = new BCSDeserializer(data);

        // ObjectCore struct:
        // - guid_creation_num: u64
        // - owner: address
        // - allow_ungated_transfer: bool
        // - transfer_events: EventHandle (optional/deprecated)

        const guidCreationNum = deserializer.deserializeU64();
        console.log(`    guid_creation_num: ${guidCreationNum}`);

        const owner = deserializer.deserializeFixedBytes(32);
        console.log(`    owner: 0x${bytesToHex(owner)}`);

        const allowUngatedTransfer = deserializer.deserializeBool();
        console.log(`    allow_ungated_transfer: ${allowUngatedTransfer}`);

    } catch (e) {
        console.log(`    (Partial decode - structure may vary): ${e}`);
    }
}

function decodeFungibleStore(data: Uint8Array) {
    console.log(`\n    --- FungibleStore Decode ---`);
    try {
        const deserializer = new BCSDeserializer(data);

        // FungibleStore struct:
        // - metadata: Object<Metadata>
        // - balance: u64
        // - frozen: bool

        const metadata = deserializer.deserializeFixedBytes(32);
        console.log(`    metadata: 0x${bytesToHex(metadata)}`);

        const balance = deserializer.deserializeU64();
        console.log(`    balance: ${balance} (${Number(balance) / 1e8} APT)`);

        const frozen = deserializer.deserializeBool();
        console.log(`    frozen: ${frozen}`);

    } catch (e) {
        console.log(`    (Partial decode - structure may vary): ${e}`);
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Use default hardcoded data for testing
        console.log('No file path provided. Using inline test data.\n');

        const testData = {
            "resource_group::0xbcbf22d35d6c08fd174ec1e031be1d865ab7ceaf0b1f3be6a28c0c238adc9058::0x1::object::ObjectGroup": "00f601020000000000000000000000000000000000000000000000000000000000000001066f626a6563740a4f626a656374436f726500590100000000000400fa6f3fa8c7b86fc7d448a208a49ea27b5041737e270d8ecbedab2c5cbe758b040000000000000000000000000000000400bcbf22d35d6c08fd174ec1e031be1d865ab7ceaf0b1f3be6a28c0c238adc905800000000000000000000000000000000000000000000000000000000000000010e66756e6769626c655f61737365740d46756e6769626c6553746f72650029000000000000000000000000000000000000000000000000000000000000000afcd47b590200000000"
        };

        for (const [key, value] of Object.entries(testData)) {
            if (key.startsWith('resource_group::')) {
                decodeResourceGroup(key, value);
            }
        }
        return;
    }

    const filePath = args[0]!;

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    console.log('=== Delta.json Decoder ===\n');
    console.log(`File: ${filePath}`);
    console.log(`Keys found: ${Object.keys(data).length}\n`);

    for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('resource_group::') && typeof value === 'string') {
            decodeResourceGroup(key, value);
        } else {
            console.log(`\nUnknown key format: ${key}`);
            console.log(`Value: ${JSON.stringify(value).substring(0, 100)}...`);
        }
    }
}

main().catch(console.error);
