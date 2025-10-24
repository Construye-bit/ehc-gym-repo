import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { useBranches } from "@/hooks/use-branches";

interface TrainerFiltersProps {
  selectedSpecialty?: string;
  selectedBranchId?: string;
  availableNow: boolean;
  onSpecialtyChange: (specialty?: string) => void;
  onBranchChange: (branchId?: string) => void;
  onAvailableNowChange: (value: boolean) => void;
}

const SPECIALTIES = [
  "Musculación",
  "Cardio",
  "CrossFit",
  "Yoga",
  "Pilates",
  "Funcional",
  "Boxeo",
  "Natación",
];

export const TrainerFilters: React.FC<TrainerFiltersProps> = ({
  selectedSpecialty,
  selectedBranchId,
  availableNow,
  onSpecialtyChange,
  onBranchChange,
  onAvailableNowChange,
}) => {
  const { branches } = useBranches();

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
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Especialidad
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              !selectedSpecialty && styles.chipSelected,
            ]}
            onPress={() => onSpecialtyChange(undefined)}
          >
            <Text
              className={
                !selectedSpecialty ? "text-white font-semibold" : "text-gray-700"
              }
            >
              Todas
            </Text>
          </TouchableOpacity>
          {SPECIALTIES.map((specialty) => (
            <TouchableOpacity
              key={specialty}
              style={[
                styles.chip,
                selectedSpecialty === specialty && styles.chipSelected,
              ]}
              onPress={() => onSpecialtyChange(specialty)}
            >
              <Text
                className={
                  selectedSpecialty === specialty
                    ? "text-white font-semibold"
                    : "text-gray-700"
                }
              >
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filtro de sede */}
      <View style={styles.section}>
        <Text className="text-sm font-semibold text-gray-700 mb-2">Sede</Text>
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
});