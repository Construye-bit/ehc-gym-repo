import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

interface DeleteSedeConfirmDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sedeName: string;
    onConfirm: () => void;
    isDeleting?: boolean;
}

export function DeleteSedeConfirmDialog({
    isOpen,
    onOpenChange,
    sedeName,
    onConfirm,
    isDeleting = false,
}: DeleteSedeConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        // No cerramos el diálogo aquí, se cerrará cuando termine la operación
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-left">
                                Eliminar Sede
                            </AlertDialogTitle>
                        </div>
                    </div>
                    <AlertDialogDescription className="text-left">
                        ¿Estás seguro de que quieres eliminar la sede{" "}
                        <span className="font-semibold text-gray-900">"{sedeName}"</span>?
                        <br />
                        <br />
                        <span className="text-red-600 font-medium">
                            Esta acción no se puede deshacer.
                        </span>
                        {" "}Todos los datos asociados a esta sede, incluyendo entrenadores asignados, se verán afectados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="hover:bg-gray-50"
                    >
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Sede
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}