import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppColors } from '@/constants/Colors';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostData) => void;
  editPost?: CreatePostData & { id: string };
}

export interface CreatePostData {
  title: string;
  content: string;
  imageUri?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editPost,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();

  useEffect(() => {
    if (editPost) {
      setTitle(editPost.title);
      setContent(editPost.content);
      setImageUri(editPost.imageUri);
    } else {
      setTitle('');
      setContent('');
      setImageUri(undefined);
    }
  }, [editPost, visible]);

  const pickImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tus fotos para que puedas seleccionar una imagen.'
        );
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      imageUri,
    });

    setTitle('');
    setContent('');
    setImageUri(undefined);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setImageUri(undefined);
    onClose();
  };

  const isFormValid = title.trim().length > 0 && content.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header} className="mt-4">
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editPost ? 'Editar Consejo' : 'Nuevo Consejo'}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
            disabled={!isFormValid}
          >
            <Text style={[styles.submitText, !isFormValid && styles.submitTextDisabled]}>
              {editPost ? 'Guardar' : 'Publicar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Título */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Escribe un título llamativo..."
              placeholderTextColor={AppColors.text.tertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Contenido */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contenido</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Comparte tu consejo de entrenamiento..."
              placeholderTextColor={AppColors.text.tertiary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>

          {/* Imagen */}
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(undefined)}
              >
                <Ionicons name="close-circle" size={24} color={AppColors.background.white} />
              </TouchableOpacity>
            </View>
          )}

          {/* Botón Agregar Imagen */}
          {!imageUri && (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color={AppColors.primary.yellow} />
              <Text style={styles.addImageText}>Agregar imagen (opcional)</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border.light,
  },
  cancelButton: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: AppColors.text.secondary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  submitButton: {
    padding: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary.yellow,
  },
  submitTextDisabled: {
    color: AppColors.text.tertiary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 16,
    color: AppColors.text.primary,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border.light,
    borderRadius: 8,
    backgroundColor: AppColors.background.gray50,
  },
  contentInput: {
    fontSize: 15,
    color: AppColors.text.primary,
    padding: 12,
    borderWidth: 1,
    borderColor: AppColors.border.light,
    borderRadius: 8,
    backgroundColor: AppColors.background.gray50,
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: AppColors.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border.light,
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
  },
  addImageText: {
    fontSize: 15,
    color: AppColors.text.secondary,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
});