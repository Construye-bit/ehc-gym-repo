import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { useBranches } from "@/hooks/use-branches";
import { useSpecialties } from "@/hooks/use-specialties";

interface TrainerFiltersProps {
  selectedSpecialties: string[]; // Cambiado a array para multi-select
  selectedBranchId?: string;
  availableNow: boolean;
  onSpecialtiesChange: (specialties: string[]) => void; // Cambiado el nombre
  onBranchChange: (branchId?: string) => void;
  onAvailableNowChange: (value: boolean) => void;
}

export const TrainerFilters: React.FC<TrainerFiltersProps> = ({
  selectedSpecialties,
  selectedBranchId,
  availableNow,
  onSpecialtiesChange,
  onBranchChange,
  onAvailableNowChange,
}) => {
  const { branches } = useBranches();
  const { specialties, isLoading: isLoadingSpecialties } = useSpecialties();

  // Función para manejar la selección/deselección de especialidades
  const handleSpecialtyToggle = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      // Si ya está seleccionada, la removemos
      onSpecialtiesChange(selectedSpecialties.filter((s) => s !== specialty));
    } else {
      // Si no está seleccionada, la agregamos
      onSpecialtiesChange([...selectedSpecialties, specialty]);
    }
  };

  // Función para limpiar todas las especialidades
  const handleClearSpecialties = () => {
    onSpecialtiesChange([]);
  };

  return (
    <View style={styles.container}>
      {/* Filtro de disponibilidad */}
      <TouchableOpacity
        style={styles.availabilityFilter}
        onPress={() => onAvailableNowChange(!availableNow)}
      >
        <Ionicons
          name={availableNow ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={availableNow ? "#10B981" : "#9CA3AF"}
        />
        <Text
          className={`ml-2 ${
            availableNow ? "text-green-700 font-semibold" : "text-gray-600"
          }`}
        >
          Disponible ahora
        </Text>
      </TouchableOpacity>

      {/* Filtro de especialidad */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text className="text-sm font-semibold text-gray-700">
            Especialidades {selectedSpecialties.length > 0 && `(${selectedSpecialties.length})`}
          </Text>
          {selectedSpecialties.length > 0 && (
            <TouchableOpacity onPress={handleClearSpecialties}>
              <Text className="text-xs text-blue-600 font-semibold">
                Limpiar
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {isLoadingSpecialties ? (
            <Text className="text-gray-400 text-sm">Cargando...</Text>
          ) : specialties.length === 0 ? (
            <Text className="text-gray-400 text-sm">
              No hay especialidades disponibles
            </Text>
          ) : (
            specialties.map((specialty: string) => {
              const isSelected = selectedSpecialties.includes(specialty);
              return (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                  onPress={() => handleSpecialtyToggle(specialty)}
                >
                  <View style={styles.chipContent}>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="white"
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      className={
                        isSelected
                          ? "text-white font-semibold"
                          : "text-gray-700"
                      }
                    >
                      {specialty}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Filtro de sede */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text className="text-sm font-semibold text-gray-700">Sede</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              !selectedBranchId && styles.chipSelected,
            ]}
            onPress={() => onBranchChange(undefined)}
          >
            <Text
              className={
                !selectedBranchId ? "text-white font-semibold" : "text-gray-700"
              }
            >
              Todas
            </Text>
          </TouchableOpacity>
          {branches?.map((branch) => (
            <TouchableOpacity
              key={branch._id}
              style={[
                styles.chip,
                selectedBranchId === branch._id && styles.chipSelected,
              ]}
              onPress={() => onBranchChange(branch._id)}
            >
              <Text
                className={
                  selectedBranchId === branch._id
                    ? "text-white font-semibold"
                    : "text-gray-700"
                }
              >
                {branch.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingVertical: 16,
  },
  availabilityFilter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chipsContainer: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: "#3B82F6",
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});