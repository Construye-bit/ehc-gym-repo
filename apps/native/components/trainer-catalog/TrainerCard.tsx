import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";

interface TrainerCardProps {
  trainer: {
    _id: string;
    name: string;
    specialties: string[];
    branch?: {
      _id: string;
      name: string;
    };
    photo_url?: string;
  };
  onPress?: () => void;
  onContactPress?: () => void; // Nueva prop para el botón de contacto
  compact?: boolean; // Para usar en el home con menos márgenes
}

export const TrainerCard: React.FC<TrainerCardProps> = ({
  trainer,
  onPress,
  onContactPress,
  compact = false,
}) => {
  const handleContactPress = (e: any) => {
    e.stopPropagation(); // Evitar que se active el onPress del card
    if (onContactPress) {
      onContactPress();
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, compact && styles.cardCompact]} 
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        {trainer.photo_url ? (
          <Image
            source={{ uri: trainer.photo_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="person" size={40} color="#9CA3AF" />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {trainer.name}
        </Text>

        {trainer.branch && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {trainer.branch.name}
            </Text>
          </View>
        )}

        <View style={styles.specialtiesContainer}>
          {trainer.specialties.slice(0, 3).map((specialty, index) => (
            <View key={index} style={styles.specialtyBadge}>
              <Text className="text-xs text-blue-700">{specialty}</Text>
            </View>
          ))}
          {trainer.specialties.length > 3 && (
            <Text className="text-xs text-gray-500 ml-1">
              +{trainer.specialties.length - 3}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.availabilityContainer}>
            <View style={styles.availableDot} />
            <Text className="text-sm text-gray-600">Disponible</Text>
          </View>

          {/* Botón de contacto */}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactPress}
          >
            <Ionicons name="chatbubble-ellipses" size={16} color="#10B981" />
            <Text className="text-green-600 text-sm font-semibold ml-1">
              Contactar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardCompact: {
    marginHorizontal: 0,
    marginVertical: 4,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    shadowOpacity: 0,
    elevation: 0,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  specialtyBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});