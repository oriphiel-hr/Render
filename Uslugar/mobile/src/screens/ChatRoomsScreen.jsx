import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { styles } from '../styles';

function formatTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('hr-HR');
}

export default function ChatRoomsScreen({
  rooms,
  loading,
  onRefresh,
  onOpenRoom
}) {
  return (
    <FlatList
      style={styles.contentArea}
      data={rooms}
      keyExtractor={(item) => item.id}
      refreshing={loading}
      onRefresh={onRefresh}
      ListEmptyComponent={<Text style={styles.emptyText}>Nema aktivnih razgovora.</Text>}
      renderItem={({ item }) => {
        const lastMessage = item.messages?.[0];
        const title = item.job?.title || item.name || 'Razgovor';
        const participants = (item.participants || []).map((p) => p.fullName).filter(Boolean).join(', ');
        return (
          <Pressable style={styles.listItem} onPress={() => onOpenRoom(item)}>
            <Text style={styles.listTitle}>{title}</Text>
            {!!participants && <Text style={styles.metaText}>{participants}</Text>}
            {!!lastMessage?.content && <Text style={styles.bodyText}>{lastMessage.content}</Text>}
            <Text style={styles.metaText}>{formatTime(lastMessage?.createdAt || item.updatedAt)}</Text>
          </Pressable>
        );
      }}
    />
  );
}
