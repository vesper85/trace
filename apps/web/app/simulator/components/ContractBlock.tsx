"use client";

import { useState, useEffect, useCallback } from "react";
import { Info, Loader2, Code, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { NetworkType, NETWORKS } from "../types";
import { movement } from "@/lib/movement";

// Types for Movement module ABI (matching the API response)
interface MoveFunctionParam {
    constraints: string[];
}

interface MoveExposedFunction {
    name: string;
    visibility: "public" | "friend" | "private";
    is_entry: boolean;
    is_view: boolean;
    generic_type_params: MoveFunctionParam[];
    params: string[];
    return: string[];
}

interface MoveModuleABI {
    address: string;
    name: string;
    friends: string[];
    exposed_functions: MoveExposedFunction[];
    structs: unknown[];
}

interface MoveModule {
    bytecode: string;
    abi: MoveModuleABI;
}

// Simplified types for UI
interface ModuleInfo {
    name: string;
    address: string;
    functions: MoveExposedFunction[];
}

interface ContractInfo {
    address: string;
    modules: ModuleInfo[];
}

interface FunctionInputValue {
    name: string;
    type: string;
    value: string;
}

interface ContractBlockProps {
    onContractChange?: (contractInfo: ContractInfo | null) => void;
    onContractAddressChange?: (address: string) => void;
    onModuleChange?: (module: ModuleInfo | null) => void;
    onFunctionChange?: (func: MoveExposedFunction | null) => void;
    onInputsChange?: (inputs: FunctionInputValue[]) => void;
    onTypeArgumentsChange?: (typeArgs: string[]) => void;
    onNetworkChange?: (network: NetworkType) => void;
}

type AddressMode = "project" | "custom";
type InputMode = "structured" | "raw";

export function ContractBlock({
    onContractChange,
    onContractAddressChange,
    onModuleChange,
    onFunctionChange,
    onInputsChange,
    onTypeArgumentsChange,
    onNetworkChange,
}: ContractBlockProps) {
    // Address input mode
    const [addressMode, setAddressMode] = useState<AddressMode>("custom");

    // Contract address
    const [contractAddress, setContractAddress] = useState("");
    const [addressValidationError, setAddressValidationError] = useState<string | null>(null);

    // Validate contract address format (0x + 64 hex characters = 32 bytes)
    const validateAddress = (address: string): string | null => {
        if (!address) return null; // Empty is okay, not an error yet

        if (!address.startsWith("0x")) {
            return "Address must start with '0x'";
        }

        const hexPart = address.slice(2);

        if (hexPart.length > 0 && !/^[a-fA-F0-9]+$/.test(hexPart)) {
            return "Address must contain only hexadecimal characters (0-9, a-f)";
        }

        if (hexPart.length > 0 && hexPart.length !== 64) {
            return `Address must be 32 bytes (64 hex characters). Currently: ${hexPart.length}/64`;
        }

        return null; // Valid
    };

    // Check if address is valid for fetching
    const isValidAddress = (address: string): boolean => {
        if (!address.startsWith("0x")) return false;
        const hexPart = address.slice(2);
        return hexPart.length === 64 && /^[a-fA-F0-9]+$/.test(hexPart);
    };

    // Network selection
    const [network, setNetwork] = useState<NetworkType>("mainnet");

    // Contract info (fetched from network)
    const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
    const [isLoadingContract, setIsLoadingContract] = useState(false);
    const [contractError, setContractError] = useState<string | null>(null);

    // Selected module
    const [selectedModule, setSelectedModule] = useState<string>("");

    // Input mode for function parameters
    const [inputMode, setInputMode] = useState<InputMode>("structured");

    // Selected function
    const [selectedFunction, setSelectedFunction] = useState<string>("");

    // Function input values
    const [inputValues, setInputValues] = useState<FunctionInputValue[]>([]);

    // Type argument values
    const [typeArgValues, setTypeArgValues] = useState<string[]>([]);

    // Raw input data (for raw mode)
    const [rawInputData, setRawInputData] = useState("");

    // Get selected module object
    const selectedModuleObj = contractInfo?.modules.find(
        (m) => m.name === selectedModule
    );

    // Get selected function object
    const selectedFunctionObj = selectedModuleObj?.functions.find(
        (f) => f.name === selectedFunction
    );

    // Fetch contract modules when address and network change
    useEffect(() => {
        const fetchContractModules = async () => {
            // Only fetch if address is valid format
            if (!isValidAddress(contractAddress)) {
                setContractInfo(null);
                setContractError(null);
                return;
            }

            setIsLoadingContract(true);
            setContractError(null);

            try {
                const networkConfig = NETWORKS[network];

                // Fetch modules from the Movement network API
                const response = await fetch(
                    `${networkConfig.fullnode}/accounts/${contractAddress}/modules?limit=1000`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Account not found or has no modules");
                    }
                    throw new Error(`Failed to fetch modules: ${response.statusText}`);
                }

                const modules: MoveModule[] = await response.json();

                if (modules.length === 0) {
                    throw new Error("No modules found at this address");
                }

                // Parse modules into our format
                const parsedModules: ModuleInfo[] = modules.map((mod) => ({
                    name: mod.abi.name,
                    address: mod.abi.address,
                    functions: mod.abi.exposed_functions,
                }));

                const info: ContractInfo = {
                    address: contractAddress,
                    modules: parsedModules,
                };

                setContractInfo(info);
                onContractChange?.(info);

                // Auto-select first module if only one exists
                if (parsedModules.length === 1 && parsedModules[0]) {
                    setSelectedModule(parsedModules[0].name);
                }
            } catch (err) {
                setContractError(
                    err instanceof Error ? err.message : "Failed to fetch contract"
                );
                setContractInfo(null);
                onContractChange?.(null);
            } finally {
                setIsLoadingContract(false);
            }
        };

        const debounceTimer = setTimeout(fetchContractModules, 500);
        return () => clearTimeout(debounceTimer);
    }, [contractAddress, network, onContractChange]);

    // Update when module changes
    useEffect(() => {
        if (selectedModuleObj) {
            onModuleChange?.(selectedModuleObj);
            setSelectedFunction("");
        } else {
            onModuleChange?.(null);
        }
    }, [selectedModuleObj, onModuleChange]);

    // Update input values when function changes
    useEffect(() => {
        if (selectedFunctionObj) {
            // Create inputs from params - params are just type strings, not named
            // Filter out &signer params as they are handled automatically
            const filteredParams = selectedFunctionObj.params.filter(
                (paramType) => paramType !== "&signer" && paramType !== "signer"
            );
            const newInputs = filteredParams.map((paramType, index) => ({
                name: `arg${index}`,
                type: paramType,
                value: "",
            }));
            setInputValues(newInputs);

            // Initialize type argument values
            const numTypeArgs = selectedFunctionObj.generic_type_params.length;
            const newTypeArgs = Array(numTypeArgs).fill("");
            setTypeArgValues(newTypeArgs);
            onTypeArgumentsChange?.(newTypeArgs);

            onFunctionChange?.(selectedFunctionObj);
        } else {
            setInputValues([]);
            setTypeArgValues([]);
            onTypeArgumentsChange?.([]);
            onFunctionChange?.(null);
        }
    }, [selectedFunctionObj, onFunctionChange, onTypeArgumentsChange]);

    // Handle input value change
    const handleInputChange = useCallback(
        (index: number, value: string) => {
            setInputValues((prev) => {
                const newInputs = [...prev];
                const existing = newInputs[index];
                if (existing) {
                    newInputs[index] = {
                        name: existing.name,
                        type: existing.type,
                        value,
                    };
                }
                onInputsChange?.(newInputs);
                return newInputs;
            });
        },
        [onInputsChange]
    );

    // Handle network change
    const handleNetworkChange = (newNetwork: NetworkType) => {
        setNetwork(newNetwork);
        setContractInfo(null);
        setSelectedModule("");
        setSelectedFunction("");
        onNetworkChange?.(newNetwork);
    };

    // Handle type argument value change
    const handleTypeArgChange = useCallback(
        (index: number, value: string) => {
            setTypeArgValues((prev) => {
                const newTypeArgs = [...prev];
                newTypeArgs[index] = value;
                onTypeArgumentsChange?.(newTypeArgs);
                return newTypeArgs;
            });
        },
        [onTypeArgumentsChange]
    );

    // Get function display type
    const getFunctionType = (func: MoveExposedFunction): string => {
        if (func.is_entry) return "entry";
        if (func.is_view) return "view";
        return "public";
    };

    // Format parameter type for display (shorten long addresses)
    const formatType = (type: string): string => {
        // Shorten addresses like 0x6a164188af7bb6a8268339343a5afe0242292713709af8801dafba3a054dc2f2
        return type.replace(/0x[a-fA-F0-9]{64}/g, (match) =>
            `${match.slice(0, 6)}...${match.slice(-4)}`
        );
    };

    // Filter functions for simulation - only show entry or view functions
    const getEntryFunctions = (functions: MoveExposedFunction[]): MoveExposedFunction[] => {
        return functions.filter((f) => f.is_entry || f.is_view);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-5 py-4 border-b">
                <h2 className="text-lg font-semibold">Contract</h2>
            </div>


            {/* donot remove */}
            <Button onClick={async () => {
                try {
                    const transaction = await movement.transaction.build.simple({
                        data: {
                            function: "0x6a164188af7bb6a8268339343a5afe0242292713709af8801dafba3a054dc2f2::pool::lend",
                            functionArguments: [0, 100000, true],
                            typeArguments: ["0x1::aptos_coin::AptosCoin"]
                        },
                        sender: "0xfa6f3fa8c7b86fc7d448a208a49ea27b5041737e270d8ecbedab2c5cbe758b04",
                    })

                    const sim = await movement.transaction.simulate.simple({
                        transaction,

                    })
                    console.log(sim)
                } catch (error) {
                    console.log(error)
                }

            }}>
                test
            </Button>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Address Mode Selection */}
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="addressMode"
                            checked={addressMode === "project"}
                            onChange={() => setAddressMode("project")}
                            className="w-4 h-4 text-primary border-muted-foreground focus:ring-primary accent-primary"
                        />
                        <span className="text-sm">Select from Project</span>
                        <Info className="w-4 h-4 text-muted-foreground" />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="addressMode"
                            checked={addressMode === "custom"}
                            onChange={() => setAddressMode("custom")}
                            className="w-4 h-4 text-primary border-muted-foreground focus:ring-primary accent-primary"
                        />
                        <span className="text-sm">Insert any address</span>
                    </label>
                </div>

                {/* Contract Address Input */}
                <div className="space-y-2">
                    <Input
                        value={contractAddress}
                        onChange={(e) => {
                            const value = e.target.value;
                            setContractAddress(value);
                            setAddressValidationError(validateAddress(value));
                            onContractAddressChange?.(value);
                        }}
                        placeholder="0x..."
                        className={`font-mono text-sm ${addressValidationError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    {addressValidationError && (
                        <p className="text-xs text-destructive">{addressValidationError}</p>
                    )}
                </div>

                {/* Network Selection */}
                <div className="space-y-2">
                    <Select value={network} onValueChange={(v) => handleNetworkChange(v as NetworkType)}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(NETWORKS).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Loading State */}
                {isLoadingContract && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            Fetching modules...
                        </span>
                    </div>
                )}

                {/* Error State */}
                {contractError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">{contractError}</p>
                    </div>
                )}

                {/* Contract Info Display */}
                {contractInfo && !isLoadingContract && (
                    <>
                        {/* Contract Summary Card */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                    <Code className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <span className="font-medium text-sm block">
                                        {contractInfo.modules.length} Module{contractInfo.modules.length > 1 ? "s" : ""}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {contractAddress.slice(0, 10)}...{contractAddress.slice(-6)}
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <FileEdit className="w-4 h-4 mr-1" />
                                Edit source
                            </Button>
                        </div>

                        {/* Module Selection (if multiple modules) */}
                        {contractInfo.modules.length > 1 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Select Module</Label>
                                <Select
                                    value={selectedModule}
                                    onValueChange={setSelectedModule}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a module" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contractInfo.modules.map((mod) => (
                                            <SelectItem key={mod.name} value={mod.name}>
                                                {mod.name} ({mod.functions.filter(f => f.is_entry).length} entry functions)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Auto-select single module info */}
                        {contractInfo.modules.length === 1 && contractInfo.modules[0] && (
                            <div className="text-sm text-muted-foreground">
                                Module: <span className="font-mono font-medium text-foreground">{contractInfo.modules[0].name}</span>
                            </div>
                        )}

                        {/* Input Mode Toggle */}
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="inputMode"
                                    checked={inputMode === "structured"}
                                    onChange={() => setInputMode("structured")}
                                    className="w-4 h-4 text-primary border-muted-foreground focus:ring-primary accent-primary"
                                />
                                <span className="text-sm">Choose function and parameters</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="inputMode"
                                    checked={inputMode === "raw"}
                                    onChange={() => setInputMode("raw")}
                                    className="w-4 h-4 text-primary border-muted-foreground focus:ring-primary accent-primary"
                                />
                                <span className="text-sm">Enter raw input data</span>
                            </label>
                        </div>

                        {inputMode === "structured" && selectedModuleObj ? (
                            <>
                                {/* Function Selection */}
                                <div className="flex gap-2">
                                    <Select
                                        value={selectedFunction}
                                        onValueChange={setSelectedFunction}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select a function" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getEntryFunctions(selectedModuleObj.functions).map((func) => (
                                                <SelectItem key={func.name} value={func.name}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{func.name}</span>
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                            {getFunctionType(func)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="default">
                                        Edit ABI
                                    </Button>
                                </div>

                                {/* Type Arguments */}
                                {selectedFunctionObj && selectedFunctionObj.generic_type_params.length > 0 && (
                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium text-muted-foreground">
                                            Type Arguments ({selectedFunctionObj.generic_type_params.length})
                                        </Label>
                                        {selectedFunctionObj.generic_type_params.map((_, index) => (
                                            <div key={`type-arg-${index}`} className="space-y-1.5">
                                                <div className="flex flex-col">
                                                    <Label className="text-sm font-medium">
                                                        T{index}
                                                    </Label>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        Type argument
                                                    </span>
                                                </div>
                                                <Input
                                                    value={typeArgValues[index] || ""}
                                                    onChange={(e) =>
                                                        handleTypeArgChange(index, e.target.value)
                                                    }
                                                    placeholder="e.g., 0x1::aptos_coin::AptosCoin"
                                                    className="font-mono text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Function Parameters */}
                                {selectedFunctionObj && inputValues.length > 0 && (
                                    <div className="space-y-4">
                                        {inputValues.map((input, index) => (
                                            <div key={`${input.name}-${index}`} className="space-y-1.5">
                                                <div className="flex flex-col">
                                                    <Label className="text-sm font-medium">
                                                        {input.name}
                                                    </Label>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {formatType(input.type)}
                                                    </span>
                                                </div>
                                                <Input
                                                    value={input.value}
                                                    onChange={(e) =>
                                                        handleInputChange(index, e.target.value)
                                                    }
                                                    placeholder={`Enter ${formatType(input.type)}`}
                                                    className="font-mono text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedFunctionObj && inputValues.length === 0 && (
                                    <div className="p-4 rounded-lg bg-muted/30 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            This function has no parameters
                                        </p>
                                    </div>
                                )}

                                {/* Function Return Type */}
                                {selectedFunctionObj && selectedFunctionObj.return.length > 0 && (
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <Label className="text-xs text-muted-foreground">Returns</Label>
                                        <div className="text-sm font-mono mt-1">
                                            {selectedFunctionObj.return.map((r, i) => (
                                                <span key={i}>
                                                    {formatType(r)}
                                                    {i < selectedFunctionObj.return.length - 1 ? ", " : ""}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : inputMode === "raw" ? (
                            /* Raw Input Mode */
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Raw Input Data</Label>
                                <textarea
                                    value={rawInputData}
                                    onChange={(e) => setRawInputData(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full h-32 px-3 py-2 text-sm font-mono rounded-md border border-input bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        ) : null}
                    </>
                )}

                {/* Empty State - No contract loaded */}
                {!contractInfo && !isLoadingContract && !contractError && contractAddress.length < 10 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <Code className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Enter a contract address to load its modules
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
