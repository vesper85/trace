#!/usr/bin/env tsx
/**
 * Script to decode BCS-encoded delta.json from aptos-sim sessions
 * 
 * Detailed hex analysis and decoding of resource group data.
 */

import * as fs from 'fs';

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

function printHexDump(data: Uint8Array, bytesPerLine: number = 16) {
    console.log('\n=== HEX DUMP ===');
    for (let i = 0; i < data.length; i += bytesPerLine) {
        const lineBytes = data.slice(i, Math.min(i + bytesPerLine, data.length));
        const hexPart = Array.from(lineBytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
        const asciiPart = Array.from(lineBytes).map(b =>
            b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'
        ).join('');
        console.log(`${i.toString(16).padStart(4, '0')}: ${hexPart.padEnd(bytesPerLine * 3, ' ')} | ${asciiPart}`);
    }
}

function readULEB128(data: Uint8Array, offset: number): { value: number; bytesRead: number } {
    let value = 0;
    let shift = 0;
    let bytesRead = 0;
    while (offset + bytesRead < data.length) {
        const byte = data[offset + bytesRead]!;
        bytesRead++;
        value |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) break;
        shift += 7;
    }
    return { value, bytesRead };
}

function tryDecodeResourceGroupV2(hexData: string) {
    const bytes = hexToBytes(hexData);
    console.log(`\nTotal bytes: ${bytes.length}`);

    printHexDump(bytes);

    console.log('\n=== ANALYSIS ===');

    // Looking at the data:
    // 00 f6 01 02 00...
    // The first byte 00 might be an option (Some/None) or version indicator
    // f6 01 is ULEB128 for 246 (0xf6) - but wait, 0xf6 has high bit set...
    // Actually: 0xf6 = 11110110, 0x01 = 00000001
    // ULEB128: (0xf6 & 0x7f) | ((0x01 & 0x7f) << 7) = 0x76 | (0x01 << 7) = 118 + 128 = 246

    let pos = 0;

    // First byte appears to be 0x00 - might be a "not from storage" flag
    console.log(`\nByte 0: ${bytes[0]?.toString(16).padStart(2, '0')} (possibly a state flag)`);
    pos = 1;

    // ULEB128 encoding for resource group size/version
    const { value: uleb1, bytesRead: br1 } = readULEB128(bytes, pos);
    console.log(`Bytes ${pos}-${pos + br1 - 1}: ULEB128 = ${uleb1} (possibly total inner size or count)`);
    pos += br1;

    // Another ULEB128 - could be entry count
    const { value: entryCount, bytesRead: br2 } = readULEB128(bytes, pos);
    console.log(`Bytes ${pos}-${pos + br2 - 1}: ULEB128 = ${entryCount} (entry count)`);
    pos += br2;

    console.log(`\n=== DECODING ${entryCount} ENTRIES ===`);

    for (let i = 0; i < entryCount && pos < bytes.length; i++) {
        console.log(`\n--- Entry ${i + 1} at offset ${pos} ---`);

        // Each entry appears to be:
        // - 32 bytes address
        // - module name (length-prefixed)
        // - struct name (length-prefixed)
        // - data length (ULEB128)
        // - data bytes

        // Read address
        const address = '0x' + bytesToHex(bytes.slice(pos, pos + 32));
        console.log(`Address: ${address}`);
        pos += 32;

        // Read module name
        const moduleLen = bytes[pos]!;
        pos++;
        const moduleName = new TextDecoder().decode(bytes.slice(pos, pos + moduleLen));
        console.log(`Module: ${moduleName} (len=${moduleLen})`);
        pos += moduleLen;

        // Read struct name
        const structLen = bytes[pos]!;
        pos++;
        const structName = new TextDecoder().decode(bytes.slice(pos, pos + structLen));
        console.log(`Struct: ${structName} (len=${structLen})`);
        pos += structLen;

        // Skip any generic type parameters (indicated by 0x00 for empty)
        // This byte might be the generic params count
        const genericCount = bytes[pos]!;
        console.log(`Generic count: ${genericCount}`);
        pos++;

        // Read data length
        const { value: dataLen, bytesRead: dataLenBytes } = readULEB128(bytes, pos);
        console.log(`Data length: ${dataLen} (ULEB128 bytes: ${dataLenBytes})`);
        pos += dataLenBytes;

        // Read data
        const data = bytes.slice(pos, pos + dataLen);
        console.log(`Data (hex): ${bytesToHex(data)}`);
        pos += dataLen;

        // Try to decode the data based on struct type
        decodeStructData(moduleName, structName, data);
    }

    if (pos < bytes.length) {
        console.log(`\n=== REMAINING ${bytes.length - pos} BYTES ===`);
        printHexDump(bytes.slice(pos));
    }
}

function decodeStructData(moduleName: string, structName: string, data: Uint8Array) {
    console.log(`\n  Decoding ${moduleName}::${structName}:`);

    if (structName === 'ObjectCore') {
        // ObjectCore struct:
        // - guid_creation_num: u64 (8 bytes)
        // - owner: address (32 bytes)
        // - allow_ungated_transfer: bool (1 byte)
        let pos = 0;

        // u64 little-endian
        const guidCreationNum = readU64LE(data, pos);
        console.log(`    guid_creation_num: ${guidCreationNum}`);
        pos += 8;

        const owner = '0x' + bytesToHex(data.slice(pos, pos + 32));
        console.log(`    owner: ${owner}`);
        pos += 32;

        const allowUngatedTransfer = data[pos]! !== 0;
        console.log(`    allow_ungated_transfer: ${allowUngatedTransfer}`);

    } else if (structName === 'FungibleStore') {
        // FungibleStore struct:
        // - metadata: Object<Metadata> (32 bytes - address of the metadata object)
        // - balance: u64 (8 bytes)
        // - frozen: bool (1 byte)
        let pos = 0;

        const metadata = '0x' + bytesToHex(data.slice(pos, pos + 32));
        console.log(`    metadata: ${metadata}`);
        pos += 32;

        const balance = readU64LE(data, pos);
        console.log(`    balance: ${balance} (${Number(balance) / 1e8} APT if this is APT)`);
        pos += 8;

        const frozen = data[pos]! !== 0;
        console.log(`    frozen: ${frozen}`);

    } else {
        console.log(`    (Unknown struct type, showing raw bytes)`);
        console.log(`    ${bytesToHex(data)}`);
    }
}

function readU64LE(data: Uint8Array, offset: number): bigint {
    let value = BigInt(0);
    for (let i = 7; i >= 0; i--) {
        value = value * BigInt(256) + BigInt(data[offset + i]!);
    }
    return value;
}

async function main() {
    const args = process.argv.slice(2);

    let hexData: string;

    if (args.length === 0) {
        console.log('Using inline test data.\n');
        hexData = "00f601020000000000000000000000000000000000000000000000000000000000000001066f626a6563740a4f626a656374436f726500590100000000000400fa6f3fa8c7b86fc7d448a208a49ea27b5041737e270d8ecbedab2c5cbe758b040000000000000000000000000000000400bcbf22d35d6c08fd174ec1e031be1d865ab7ceaf0b1f3be6a28c0c238adc905800000000000000000000000000000000000000000000000000000000000000010e66756e6769626c655f61737365740d46756e6769626c6553746f72650029000000000000000000000000000000000000000000000000000000000000000afcd47b590200000000";
    } else {
        const filePath = args[0]!;
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Get the first resource group value
        const key = Object.keys(data)[0];
        console.log(`Key: ${key}`);
        hexData = data[key];
    }

    tryDecodeResourceGroupV2(hexData);
}

main().catch(console.error);
