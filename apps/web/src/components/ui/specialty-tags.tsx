import * as React from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "./input";
import { Badge } from "./badge";

interface SpecialtyTagsProps {
    specialties: string[];
    onAdd: (specialty: string) => void;
    onRemove: (index: number) => void;
}

const SpecialtyTags: React.FC<SpecialtyTagsProps> = ({ specialties, onAdd, onRemove }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const trimmedValue = inputValue.trim();
            if (trimmedValue && !specialties.includes(trimmedValue)) {
                onAdd(trimmedValue);
                setInputValue("");
            }
        }
    };

    return (
        <div className="space-y-3">
            <Input
                placeholder="Escribe una especialidad y presiona Enter"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-black outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                        <Badge
                            key={index}
                            variant="default"
                            className="pr-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        >
                            {specialty}
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="ml-2 hover:bg-yellow-300 rounded-full p-0.5 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};

export { SpecialtyTags };