import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { Text } from "@/components/ui";
import { TrainerCard } from "@/components/trainer-catalog/TrainerCard";
import { TrainerFilters } from "@/components/trainer-catalog/TrainerFilters";
import { useTrainerCatalog } from "@/hooks/use-trainer-catalog";
import { AppColors } from "@/constants/Colors";
import api from "@/api";
import type { Id } from "@/api";

export default function TrainerCatalogScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    specialties: [] as string[], // Cambiado a array
    branchId: undefined as string | undefined,
    availableNow: false,
  });

  const { trainers, isLoading, hasMore, loadMore } = useTrainerCatalog(filters);
  const createOrGetConversationMutation = useMutation(api.chat.conversations.mutations.createOrGet);

  const handleContactTrainer = async (trainerId: string) => {
    try {
      // Mostrar loading
      Alert.alert("Iniciando conversación...");

      // Crear o recuperar conversación
      const result = await createOrGetConversationMutation({
        trainerId: trainerId as Id<"trainers">,
      });

      if (result.success) {
        // Navegar a la conversación
        router.push(`/(chat)/${result.data.conversationId}` as any);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudo iniciar la conversación"
      );
    }
  };

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
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Entrenadores",
          headerShown: true,
          headerStyle: {
            backgroundColor: AppColors.primary.yellow,
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <TrainerFilters
        selectedSpecialties={filters.specialties}
        selectedBranchId={filters.branchId}
        availableNow={filters.availableNow}
        onSpecialtiesChange={(specialties) =>
          setFilters({ ...filters, specialties })
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
            onContactPress={() => handleContactTrainer(item.trainer_id)}
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
                specialties: [],
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