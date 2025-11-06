import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    StatusBar,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import api from "@/api";
import type { Id } from "@/api";
import { Container } from "@/components/container";
import { useAuth } from "@/hooks/use-auth";
import { TrainerCard } from "@/components/trainer-catalog/TrainerCard";
import { TrainerFilters } from "@/components/trainer-catalog/TrainerFilters";
import { useTrainerCatalog } from "@/hooks/use-trainer-catalog";
import { AppHeader } from "@/components/shared";
import { AppColors } from "@/constants/Colors";

export default function Home() {
    const { isLoading, isClient, isTrainer, person, roles } = useAuth();
    const router = useRouter();

    // Estado para filtros del catálogo de entrenadores
    const [trainerFilters, setTrainerFilters] = useState({
        specialties: [] as string[], // Cambiado a array
        branchId: undefined as string | undefined,
        availableNow: false,
    });

    // Mutations y queries para admins (todos)
    const [newTodoText, setNewTodoText] = useState("");
    const todos = useQuery(api.todos.getAll);
    const createTodoMutation = useMutation(api.todos.create);
    const toggleTodoMutation = useMutation(api.todos.toggle);
    const deleteTodoMutation = useMutation(api.todos.deleteTodo);

    const createOrGetConversationMutation = useMutation(api.chat.conversations.mutations.createOrGet);

    // Hook para el catálogo de entrenadores (solo para clientes)
    const { trainers, isLoading: isLoadingTrainers, hasMore, loadMore } = useTrainerCatalog(
        isClient ? trainerFilters : { specialties: [], branchId: undefined, availableNow: false }
    );

    // Queries para el dashboard del entrenador (siempre llamar hooks, pero skip si no es trainer)
    const dashboardData = useQuery(
        api.trainers.dashboard.getTrainerDashboard,
        isTrainer ? {} : "skip"
    );
    const recentPosts = useQuery(
        api.trainers.dashboard.getRecentPosts,
        isTrainer ? { limit: 3 } : "skip"
    );
    const recentConversations = useQuery(
        api.trainers.dashboard.getRecentConversations,
        isTrainer ? { limit: 5 } : "skip"
    );

    const handleContactTrainer = async (trainerId: string) => {
        try {
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

    const handleAddTodo = async () => {
        const text = newTodoText.trim();
        if (!text) return;
        await createTodoMutation({ text });
        setNewTodoText("");
    };

    const handleToggleTodo = (id: Id<"todos">, currentCompleted: boolean) => {
        toggleTodoMutation({ id, completed: !currentCompleted });
    };

    const handleDeleteTodo = (id: Id<"todos">) => {
        Alert.alert("Eliminar Tarea", "¿Estás seguro de que quieres eliminar esta tarea?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => deleteTodoMutation({ id }) },
        ]);
    };

    if (isLoading) {
        return (
            <Container>
                <View className="flex-1 justify-center items-center bg-white">
                    <ActivityIndicator size="large" color="#a16207" />
                    <Text className="mt-4 text-gray-600">Cargando...</Text>
                </View>
            </Container>
        );
    }

    // Vista para CLIENTES
    if (isClient) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar backgroundColor={AppColors.primary.yellow} barStyle="light-content" />

                <AppHeader userType="CLIENT" />

                {/* Lista con scroll */}
                <FlatList
                    data={trainers}
                    keyExtractor={(trainer) => trainer.trainer_id}
                    ListHeaderComponent={
                        <>
                            {/* Catálogo de Entrenadores - Header */}
                            <View className="px-5 py-6">
                                <View className="bg-white rounded-t-2xl shadow-sm border border-gray-100">
                                    <View className="px-5 pt-5 pb-3">
                                        <View className="flex-row items-center mb-3">
                                            <View
                                                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                                style={{ backgroundColor: '#FFF4E6' }}
                                            >
                                                <Ionicons name="people" size={20} color={AppColors.primary.yellow} />
                                            </View>
                                            <Text className="text-gray-900 text-xl font-bold">
                                                Entrenadores Disponibles
                                            </Text>
                                        </View>
                                    </View>

                                    <TrainerFilters
                                        selectedSpecialties={trainerFilters.specialties}
                                        selectedBranchId={trainerFilters.branchId}
                                        availableNow={trainerFilters.availableNow}
                                        onSpecialtiesChange={(specialties) =>
                                            setTrainerFilters({ ...trainerFilters, specialties })
                                        }
                                        onBranchChange={(branchId) =>
                                            setTrainerFilters({ ...trainerFilters, branchId })
                                        }
                                        onAvailableNowChange={(availableNow) =>
                                            setTrainerFilters({ ...trainerFilters, availableNow })
                                        }
                                    />

                                    {trainers.length > 0 && (
                                        <View className="px-5 py-2">
                                            <Text className="text-sm text-gray-600">
                                                {trainers.length} entrenador{trainers.length !== 1 ? "es" : ""} encontrado
                                                {trainers.length !== 1 ? "s" : ""}
                                            </Text>
                                        </View>
                                    )}

                                    {isLoadingTrainers && (
                                        <View className="py-8 items-center">
                                            <ActivityIndicator size="large" color={AppColors.primary.yellow} />
                                            <Text className="text-gray-500 mt-2">Cargando entrenadores...</Text>
                                        </View>
                                    )}

                                    {!isLoadingTrainers && trainers.length === 0 && (
                                        <View className="py-8 items-center px-5">
                                            <Ionicons name="people-outline" size={48} color="#d1d5db" />
                                            <Text className="text-gray-400 mt-2 text-center">
                                                No se encontraron entrenadores con los filtros seleccionados
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </>
                    }
                    renderItem={({ item: trainer }) => (
                        <View className="px-5">
                            <View className="bg-white border-x border-gray-100">
                                <TrainerCard
                                    trainer={{
                                        _id: trainer.trainer_id,
                                        name: trainer.name,
                                        specialties: trainer.specialties,
                                        branch: trainer.branch ?? undefined,
                                    }}
                                    compact={true}
                                    onPress={() => {
                                        console.log("Trainer pressed:", trainer.trainer_id);
                                    }}
                                    onContactPress={() => handleContactTrainer(trainer.trainer_id)}
                                />
                            </View>
                        </View>
                    )}
                    ListFooterComponent={
                        <>
                            {!isLoadingTrainers && trainers.length > 0 && (
                                <View className="px-5 pb-6">
                                    <View className="bg-white rounded-b-2xl shadow-sm border border-gray-100 h-4" />
                                </View>
                            )}
                            {hasMore && (
                                <View className="py-4 items-center">
                                    <ActivityIndicator size="small" color={AppColors.primary.yellow} />
                                </View>
                            )}
                        </>
                    }
                    onEndReached={() => {
                        if (hasMore) {
                            loadMore();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    className="flex-1 bg-gray-50"
                />
            </SafeAreaView>
        );
    }

    // Vista para ENTRENADORES
    if (isTrainer) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar backgroundColor={AppColors.primary.yellow} barStyle="light-content" />

                <AppHeader userType="TRAINER" />

                <ScrollView className="flex-1 bg-gray-50">
                    <View className="px-5 py-6">
                        {/* Bienvenida */}
                        {/* {dashboardData && (
                            <View className="mb-6">
                                <Text className="text-gray-900 text-2xl font-bold">
                                    Hola, {dashboardData.trainer_info.name.split(' ')[0]} 👋
                                </Text>
                                <Text className="text-gray-500 text-sm mt-1">
                                    {dashboardData.trainer_info.specialties.join(' • ')}
                                </Text>
                            </View>
                        )} */}

                        {/* Estadísticas Principales */}
                        {dashboardData && (
                            <View className="flex-row gap-3 mb-6">{/*...rest of stats...*/}
                                {/* Publicaciones */}
                                <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Ionicons name="newspaper" size={20} color={AppColors.primary.yellow} />
                                        <Text className="text-2xl font-bold text-gray-900">
                                            {dashboardData.stats.total_posts}
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-gray-500">Publicaciones</Text>
                                    <Text className="text-xs text-gray-400 mt-1">
                                        {dashboardData.stats.total_likes} me gusta
                                    </Text>
                                </View>

                                {/* Conversaciones */}
                                <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Ionicons name="chatbubbles" size={20} color={AppColors.primary.yellow} />
                                        <Text className="text-2xl font-bold text-gray-900">
                                            {dashboardData.stats.active_conversations}
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-gray-500">Activos</Text>
                                    {dashboardData.stats.unread_messages > 0 && (
                                        <View className="flex-row items-center mt-1">
                                            <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                                            <Text className="text-xs text-red-500 font-medium">
                                                {dashboardData.stats.unread_messages} nuevos
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Accesos Rápidos */}
                        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                            <Text className="text-gray-900 text-lg font-bold mb-4">Accesos Rápidos</Text>

                            {/* Gestionar Publicaciones */}
                            <TouchableOpacity
                                className="flex-row items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 mb-3"
                                onPress={() => router.push('/(blog)/trainer-feed')}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#FFF4E6' }}>
                                        <Ionicons name="newspaper" size={20} color={AppColors.primary.yellow} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 text-base font-semibold">Gestionar Publicaciones</Text>
                                        <Text className="text-gray-500 text-xs">Crea y edita consejos</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </TouchableOpacity>

                            {/* Mensajes */}
                            <TouchableOpacity
                                className="flex-row items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
                                onPress={() => router.push('/(chat)')}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#FFF4E6' }}>
                                        <Ionicons name="chatbubbles" size={20} color={AppColors.primary.yellow} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 text-base font-semibold">Mensajes</Text>
                                        <Text className="text-gray-500 text-xs">Conversaciones con clientes</Text>
                                    </View>
                                    {dashboardData && dashboardData.stats.unread_messages > 0 && (
                                        <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-2">
                                            <Text className="text-white text-xs font-bold">
                                                {dashboardData.stats.unread_messages > 9 ? '9+' : dashboardData.stats.unread_messages}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        {/* Publicaciones Recientes */}
                        {recentPosts && recentPosts.length > 0 && (
                            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-gray-900 text-lg font-bold">Publicaciones Recientes</Text>
                                    <TouchableOpacity onPress={() => router.push('/(blog)/trainer-feed')}>
                                        <Text className="text-sm font-medium" style={{ color: AppColors.primary.yellow }}>
                                            Ver todas
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {recentPosts.map((post, index) => (
                                    <View
                                        key={post._id}
                                        className={`py-3 ${index !== recentPosts.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>
                                            {post.title}
                                        </Text>
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-gray-500 text-xs">
                                                {new Date(post.published_at).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </Text>
                                            <View className="flex-row items-center">
                                                <Ionicons name="heart" size={14} color="#ef4444" />
                                                <Text className="text-gray-600 text-xs ml-1">
                                                    {post.likes_count}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Conversaciones Recientes */}
                        {recentConversations && recentConversations.length > 0 && (
                            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-gray-900 text-lg font-bold">Conversaciones Recientes</Text>
                                    <TouchableOpacity onPress={() => router.push('/(chat)')}>
                                        <Text className="text-sm font-medium" style={{ color: AppColors.primary.yellow }}>
                                            Ver todas
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {recentConversations.map((conversation, index) => (
                                    <TouchableOpacity
                                        key={conversation._id}
                                        className={`py-3 ${index !== recentConversations.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        onPress={() => router.push(`/(chat)/${conversation._id}` as any)}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1">
                                                <Text className="text-gray-900 font-semibold mb-1">
                                                    {conversation.client_name}
                                                </Text>
                                                <Text className="text-gray-500 text-xs" numberOfLines={1}>
                                                    {conversation.last_message_text || 'Sin mensajes'}
                                                </Text>
                                            </View>
                                            <View className="items-end ml-3">
                                                <Text className="text-gray-400 text-xs mb-1">
                                                    {new Date(conversation.last_message_at).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </Text>
                                                {conversation.unread_count > 0 && (
                                                    <View className="w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                                                        <Text className="text-white text-xs font-bold">
                                                            {conversation.unread_count}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Información de Sede */}
                        {dashboardData && dashboardData.trainer_info.branch && (
                            <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="business" size={20} color={AppColors.primary.yellow} />
                                    <Text className="text-gray-900 text-lg font-bold ml-2">Mi Sede</Text>
                                </View>
                                <Text className="text-gray-900 font-semibold mb-1">
                                    {dashboardData.trainer_info.branch.name}
                                </Text>
                                {dashboardData.trainer_info.branch.city && (
                                    <Text className="text-gray-500 text-sm">
                                        {dashboardData.trainer_info.branch.city}
                                    </Text>
                                )}
                                {dashboardData.trainer_info.branch.phone && (
                                    <View className="flex-row items-center mt-2">
                                        <Ionicons name="call" size={14} color="#6b7280" />
                                        <Text className="text-gray-600 text-sm ml-1">
                                            {dashboardData.trainer_info.branch.phone}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Estado de Carga */}
                        {!dashboardData && (
                            <View className="flex-1 justify-center items-center py-12">
                                <ActivityIndicator size="large" color={AppColors.primary.yellow} />
                                <Text className="text-gray-500 mt-4">Cargando dashboard...</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Vista por defecto (Admin o sin rol)
    return (
        <Container>
            <ScrollView className="flex-1">
                <View className="px-4 py-6">
                    <View className="mb-6 rounded-lg border border-border p-4 bg-card">
                        <Text className="text-foreground text-2xl font-bold mb-4">Todos</Text>

                        <View className="mb-4">
                            <View className="flex-row items-center space-x-2">
                                <TextInput
                                    value={newTodoText}
                                    onChangeText={setNewTodoText}
                                    placeholder="Add a new task..."
                                    placeholderTextColor="#6b7280"
                                    className="flex-1 border border-border rounded-md px-3 py-2 text-foreground bg-background"
                                    onSubmitEditing={handleAddTodo}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    onPress={handleAddTodo}
                                    disabled={!newTodoText.trim()}
                                    className={`px-4 py-2 rounded-md ${!newTodoText.trim() ? "bg-muted" : "bg-primary"}`}
                                >
                                    <Text className="text-white font-medium">Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {todos === undefined ? (
                            <View className="flex justify-center py-8">
                                <ActivityIndicator size="large" color="#3b82f6" />
                            </View>
                        ) : todos.length === 0 ? (
                            <Text className="py-8 text-center text-muted-foreground">No todos yet.</Text>
                        ) : (
                            <View className="space-y-2">
                                {todos.map((todo) => (
                                    <View
                                        key={todo._id}
                                        className="flex-row items-center justify-between rounded-md border border-border p-3 bg-background"
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <TouchableOpacity
                                                onPress={() => handleToggleTodo(todo._id, todo.completed)}
                                                className="mr-3"
                                            >
                                                <Ionicons
                                                    name={todo.completed ? "checkbox" : "square-outline"}
                                                    size={24}
                                                    color={todo.completed ? "#22c55e" : "#6b7280"}
                                                />
                                            </TouchableOpacity>
                                            <Text className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                                {todo.text}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteTodo(todo._id)} className="ml-2 p-1">
                                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>
        </Container>
    );
}
