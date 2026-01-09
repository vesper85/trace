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

// Types for Movement module ABI
interface MoveFunctionParam {
    constraints: string[];
}

export interface MoveExposedFunction {
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

export interface ModuleInfo {
    name: string;
    address: string;
    functions: MoveExposedFunction[];
}

export interface ContractInfo {
    address: string;
    modules: ModuleInfo[];
}

export interface FunctionInputValue {
    name: string;
    type: string;
    value: string;
}

interface ContractSelectorProps {
    /** Network fullnode URL to fetch modules from */
    networkUrl: string;
    onContractAddressChange?: (address: string) => void;
    onModuleChange?: (module: ModuleInfo | null) => void;
    onFunctionChange?: (func: MoveExposedFunction | null) => void;
    onInputsChange?: (inputs: FunctionInputValue[]) => void;
    onTypeArgumentsChange?: (typeArgs: string[]) => void;
}

type InputMode = "structured" | "raw";

export function ContractSelector({
    networkUrl,
    onContractAddressChange,
    onModuleChange,
    onFunctionChange,
    onInputsChange,
    onTypeArgumentsChange,
}: ContractSelectorProps) {
    // Contract address
    const [contractAddress, setContractAddress] = useState("");
    const [addressValidationError, setAddressValidationError] = useState<string | null>(null);

    // Validate contract address format (0x + 64 hex characters = 32 bytes)
    const validateAddress = (address: string): string | null => {
        if (!address) return null;

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

        return null;
    };

    // Check if address is valid for fetching
    const isValidAddress = (address: string): boolean => {
        if (!address.startsWith("0x")) return false;
        const hexPart = address.slice(2);
        return hexPart.length === 64 && /^[a-fA-F0-9]+$/.test(hexPart);
    };

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

    // Fetch contract modules when address changes
    useEffect(() => {
        const fetchContractModules = async () => {
            if (!isValidAddress(contractAddress) || !networkUrl) {
                setContractInfo(null);
                setContractError(null);
                return;
            }

            setIsLoadingContract(true);
            setContractError(null);

            try {
                const response = await fetch(
                    `${networkUrl}/accounts/${contractAddress}/modules?limit=1000`
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

                // Auto-select first module if only one exists
                if (parsedModules.length === 1 && parsedModules[0]) {
                    setSelectedModule(parsedModules[0].name);
                }
            } catch (err) {
                setContractError(
                    err instanceof Error ? err.message : "Failed to fetch contract"
                );
                setContractInfo(null);
            } finally {
                setIsLoadingContract(false);
            }
        };

        const debounceTimer = setTimeout(fetchContractModules, 500);
        return () => clearTimeout(debounceTimer);
    }, [contractAddress, networkUrl]);

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
        return type.replace(/0x[a-fA-F0-9]{64}/g, (match) =>
            `${match.slice(0, 6)}...${match.slice(-4)}`
        );
    };

    // Filter functions - only show entry or view functions
    const getEntryFunctions = (functions: MoveExposedFunction[]): MoveExposedFunction[] => {
        return functions.filter((f) => f.is_entry || f.is_view);
    };

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-semibold">Select Contract & Function</h3>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Contract Address Input */}
                <div className="space-y-2">
                    <Label className="text-sm">Contract Address</Label>
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
                        {/* Contract Summary */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                <Code className="w-4 h-4 text-primary" />
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

                        {selectedModuleObj && (
                            <>
                                {/* Function Selection */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Function</Label>
                                    <Select
                                        value={selectedFunction}
                                        onValueChange={setSelectedFunction}
                                    >
                                        <SelectTrigger className="w-full">
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
                                </div>

                                {/* Type Arguments */}
                                {selectedFunctionObj && selectedFunctionObj.generic_type_params.length > 0 && (
                                    <div className="space-y-3">
                                        <Label className="text-sm text-muted-foreground">
                                            Type Arguments ({selectedFunctionObj.generic_type_params.length})
                                        </Label>
                                        {selectedFunctionObj.generic_type_params.map((_, index) => (
                                            <div key={`type-arg-${index}`} className="space-y-1">
                                                <Label className="text-xs">T{index}</Label>
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
                                    <div className="space-y-3">
                                        <Label className="text-sm text-muted-foreground">
                                            Parameters ({inputValues.length})
                                        </Label>
                                        {inputValues.map((input, index) => (
                                            <div key={`${input.name}-${index}`} className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-xs">{input.name}</Label>
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
                                    <div className="p-3 rounded-lg bg-muted/30 text-center">
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
                        )}
                    </>
                )}

                {/* Empty State */}
                {!contractInfo && !isLoadingContract && !contractError && contractAddress.length < 10 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                            <Code className="w-5 h-5 text-muted-foreground" />
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
