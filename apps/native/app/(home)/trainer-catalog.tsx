import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Text } from "@/components/ui";
import { TrainerCard } from "@/components/trainer-catalog/TrainerCard";
import { TrainerFilters } from "@/components/trainer-catalog/TrainerFilters";
import { useTrainerCatalog } from "@/hooks/use-trainer-catalog";

export default function TrainerCatalogScreen() {
  const [filters, setFilters] = useState({
    specialty: undefined as string | undefined,
    branchId: undefined as string | undefined,
    availableNow: false,
  });

  const { trainers, isLoading, hasMore, loadMore } =
    useTrainerCatalog(filters);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadMore();
    }
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text className="text-gray-500 text-center">
          No se encontraron entrenadores con los filtros seleccionados
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Entrenadores",
          headerShown: true,
        }}
      />

      <TrainerFilters
        selectedSpecialty={filters.specialty}
        selectedBranchId={filters.branchId}
        availableNow={filters.availableNow}
        onSpecialtyChange={(specialty) =>
          setFilters({ ...filters, specialty })
        }
        onBranchChange={(branchId) => setFilters({ ...filters, branchId })}
        onAvailableNowChange={(availableNow) =>
          setFilters({ ...filters, availableNow })
        }
      />

      {trainers.length > 0 && (
        <View style={styles.countContainer}>
          <Text className="text-sm text-gray-600">
            {trainers.length} entrenador{trainers.length !== 1 ? "es" : ""} encontrado
            {trainers.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      <FlatList
        data={trainers}
        renderItem={({ item }) => (
          <TrainerCard
            trainer={{
              _id: item.trainer_id,
              name: item.name,
              specialties: item.specialties,
              branch: item.branch ?? undefined,
            }}
            onPress={() => {
              // Navegar a detalle del entrenador
              console.log("Trainer pressed:", item.trainer_id);
            }}
          />
        )}
        keyExtractor={(item) => item.trainer_id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              // Reset filters and reload
              setFilters({
                specialty: undefined,
                branchId: undefined,
                availableNow: false,
              });
            }}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
});