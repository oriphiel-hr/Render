import React from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { styles } from '../styles';

function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('hr-HR');
}

export default function ChatRoomScreen({
  room,
  messages,
  loading,
  sending,
  threadLocked,
  lockReason,
  chatInput,
  setChatInput,
  onBack,
  onRefresh,
  onSendMessage,
  onSendImage
}) {
  return (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>{room?.job?.title || room?.name || 'Chat'}</Text>
      <Pressable style={styles.buttonSecondary} onPress={onBack}>
        <Text style={styles.buttonText}>Natrag na razgovore</Text>
      </Pressable>

      {threadLocked && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Thread je zaključan{lockReason ? ` (${lockReason})` : ''}.
          </Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={onRefresh}
        style={styles.chatList}
        ListEmptyComponent={<Text style={styles.emptyText}>Nema poruka.</Text>}
        renderItem={({ item }) => (
          <View style={styles.chatBubble}>
            <Text style={styles.listTitle}>{item.sender?.fullName || item.senderId}</Text>
            {!!item.content && <Text style={styles.bodyText}>{item.content}</Text>}
            {!!item.attachments?.length && item.attachments.map((att, idx) => (
              <Text key={`${item.id}-att-${idx}`} style={styles.metaText}>
                Privitak {idx + 1}: {att?.imageUrl || att?.url || 'datoteka'}
              </Text>
            ))}
            <Text style={styles.metaText}>{formatTime(item.createdAt)}</Text>
          </View>
        )}
      />

      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={chatInput}
        onChangeText={setChatInput}
        placeholder={threadLocked ? 'Thread je zaključan' : 'Upišite poruku'}
        multiline
        editable={!threadLocked && !sending}
      />

      <View style={styles.row}>
        <Pressable style={[styles.button, (threadLocked || sending) && styles.buttonDisabled]} onPress={onSendMessage} disabled={threadLocked || sending}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pošalji</Text>}
        </Pressable>
        <Pressable style={[styles.buttonSecondary, (threadLocked || sending) && styles.buttonDisabled]} onPress={onSendImage} disabled={threadLocked || sending}>
          <Text style={styles.buttonText}>Pošalji sliku</Text>
        </Pressable>
      </View>
    </View>
  );
}
