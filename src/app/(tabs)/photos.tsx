import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '../../store/AppContext';
import { PhotoProgress } from '../../types';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';

type PhotoType = 'Frente' | 'Lado' | 'Espalda';

export default function PhotosScreen() {
  const { photos, addPhoto } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>('Frente');

  // Sort photos chronologically (oldest first, to see progression)
  const sortedPhotos = [...photos].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("¡Necesitamos permisos de cámara para continuar!");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
    } else {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("¡Necesitamos permisos para acceder a tus fotos!");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const handleSavePhoto = () => {
    if (selectedImage) {
      const newPhoto: PhotoProgress = {
        id: Math.random().toString(36).substring(7),
        uri: selectedImage,
        date: new Date().toISOString(),
        type: photoType,
      };
      addPhoto(newPhoto);
      setModalVisible(false);
      setSelectedImage(null);
    }
  };

  const renderPhotoItem = ({ item }: { item: PhotoProgress }) => (
    <View style={styles.photoCard}>
      <Image source={{ uri: item.uri }} style={styles.photoImage} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.photoType}>{item.type}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>PROGRESO FOTOGRÁFICO</Text>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(true)}>
          <Camera size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>TOMAR FOTO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]} onPress={() => pickImage(false)}>
          <ImageIcon size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>GALERÍA</Text>
        </TouchableOpacity>
      </View>

      {sortedPhotos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aún no hay fotos. ¡Registra tu progreso hoy!</Text>
        </View>
      ) : (
        <FlatList
          data={sortedPhotos}
          keyExtractor={(item) => item.id}
          renderItem={renderPhotoItem}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Save Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => { setModalVisible(false); setSelectedImage(null); }}
            >
              <X size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>GUARDAR PROGRESO</Text>

            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            )}

            <Text style={styles.modalSubtitle}>¿Qué pose es esta?</Text>
            <View style={styles.typeSelector}>
              {(['Frente', 'Lado', 'Espalda'] as PhotoType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, photoType === type && styles.typeOptionActive]}
                  onPress={() => setPhotoType(type)}
                >
                  <Text style={[styles.typeOptionText, photoType === type && styles.typeOptionTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSavePhoto}>
              <Text style={styles.saveButtonText}>CONFIRMAR Y GUARDAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E63946',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#aaaaaa',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  photoCard: {
    width: '48%',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  photoImage: {
    width: '100%',
    aspectRatio: 3/4,
  },
  photoInfo: {
    padding: 10,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
  },
  photoDate: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  photoType: {
    color: '#E63946',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalSubtitle: {
    color: '#aaaaaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  typeOptionText: {
    color: '#aaaaaa',
    fontWeight: 'bold',
    fontSize: 12,
  },
  typeOptionTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
});
