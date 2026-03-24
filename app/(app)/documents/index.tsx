import { Text } from '@/components/ui/text';
import { useDocumentStore } from '@/lib/store/document.store';
import type {
  CreateDocumentPayload,
  DocumentStatus,
  FuelType,
  LegalDocument,
} from '@/lib/types/document.types';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// ─── Status config ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<DocumentStatus, {
  label: string; emoji: string; bgClass: string; textClass: string;
}> = {
  pending_signature: {
    label: 'Awaiting Signature', emoji: '✍️',
    bgClass: 'bg-orange-500/10', textClass: 'text-orange-400',
  },
  signed: {
    label: 'Signed', emoji: '✅',
    bgClass: 'bg-brand-teal/8', textClass: 'text-brand-teal',
  },
  expired: {
    label: 'Expired', emoji: '⏰',
    bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted',
  },
};

const FUEL_LABELS: Record<FuelType, string> = {
  electricity: '⚡ Electricity',
  gas:         '🔥 Gas',
  dual:        '⚡🔥 Dual Fuel',
  any:         'All Energy',
};

const TYPE_ICONS: Record<string, string> = {
  loa:             '📋',
  contract:        '📑',
  bill:            '🧾',
  vat_declaration: '⚖️',
  other:           '📄',
};

const TYPE_LABELS: Record<string, string> = {
  loa:             'Letter of Authority',
  contract:        'Energy Contract',
  bill:            'Energy Bill',
  vat_declaration: 'VAT Declaration',
  other:           'Document',
};

const FILTER_TABS: { id: DocumentStatus | 'all'; label: string }[] = [
  { id: 'all',               label: 'All'     },
  { id: 'pending_signature', label: 'Pending' },
  { id: 'signed',            label: 'Signed'  },
  { id: 'expired',           label: 'Expired' },
];

// ─── Document card ─────────────────────────────────────────────────

function DocumentCard({ doc }: { doc: LegalDocument }) {
  const cfg  = STATUS_CONFIG[doc.status];
  const date = new Date(doc.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const isPending = doc.status === 'pending_signature';

  // Expiry warning: show if < 30 days and not signed
  const showExpiryWarning =
    doc.daysUntilExpiry !== null &&
    doc.daysUntilExpiry <= 30 &&
    doc.status === 'pending_signature';

  return (
    <Pressable onPress={() => router.push(`/(app)/documents/${doc._id}` as any)}>
      <View className={[
        'bg-card rounded-card p-4 mb-2.5 border',
        isPending ? 'border-orange-500/30' : 'border-border',
      ].join(' ')}>

        {/* ── Top row ── */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-1.5 flex-wrap flex-1 mr-2">
            {/* Status badge */}
            <View className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${cfg.bgClass}`}>
              <Text className={`text-xs font-semibold ${cfg.textClass}`}>
                {cfg.emoji} {cfg.label}
              </Text>
            </View>

            {/* NEW: Sent by broker badge */}
            {doc.sentByAdmin && (
              <View className="bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5">
                <Text className="text-xs font-semibold text-brand-blue-bright">
                  📩 From Broker
                </Text>
              </View>
            )}

            {/* PDF available badge */}
            {doc.hasPdf && (
              <View className="bg-brand-teal/8 rounded px-1.5 py-0.5 border border-brand-teal/20">
                <Text className="text-xs font-sans text-brand-teal">PDF</Text>
              </View>
            )}
          </View>

          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted flex-shrink-0">
            {date}
          </Text>
        </View>

        {/* ── Document info ── */}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            {/* Icon + title */}
            <View className="flex-row items-center gap-2 mb-1.5">
              <View className="w-8 h-8 rounded-lg bg-primary/13 border border-primary/20 items-center justify-center">
                <Text style={{ fontSize: 16 }}>
                  {TYPE_ICONS[doc.type] || '📄'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-brand dark:text-brand-fg" numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  {doc.docNumber}
                </Text>
              </View>
            </View>

            {/* NEW: Supplier + fuelType badges */}
            <View className="flex-row flex-wrap gap-1.5 mt-1">
              {doc.supplier && (
                <View className="bg-primary/6 dark:bg-brand-selected rounded-md px-2 py-0.5">
                  <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                    🏢 {doc.supplier}
                  </Text>
                </View>
              )}
              {doc.fuelType && doc.fuelType !== 'any' && (
                <View className="bg-primary/6 dark:bg-brand-selected rounded-md px-2 py-0.5">
                  <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                    {FUEL_LABELS[doc.fuelType]}
                  </Text>
                </View>
              )}
              {(!doc.supplier && (!doc.fuelType || doc.fuelType === 'any')) && (
                <View className="bg-primary/6 dark:bg-brand-selected rounded-md px-2 py-0.5">
                  <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                    {TYPE_LABELS[doc.type] || 'Document'}
                  </Text>
                </View>
              )}
            </View>

            {/* NEW: description preview if sentByAdmin */}
            {doc.sentByAdmin && doc.description && (
              <Text
                className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-1.5 leading-4"
                numberOfLines={2}
              >
                "{doc.description}"
              </Text>
            )}
          </View>

          {/* Right side */}
          <View className="items-end gap-1 flex-shrink-0">
            {doc.status === 'signed' && doc.signature?.signedAt && (
              <View className="items-end">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Signed</Text>
                <Text className="text-xs font-semibold text-brand-teal">
                  {new Date(doc.signature.signedAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short',
                  })}
                </Text>
              </View>
            )}
            {doc.expiresAt && doc.status !== 'signed' && (
              <View className="items-end">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Expires</Text>
                <Text className={`text-xs font-semibold ${showExpiryWarning ? 'text-orange-400' : 'text-brand dark:text-brand-fg'}`}>
                  {new Date(doc.expiresAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short',
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Action hint for pending ── */}
        {isPending && (
          <View className="mt-2.5 pt-2.5 border-t border-orange-500/15 flex-row items-center gap-1.5">
            {doc.sentByAdmin
              ? <Text className="text-xs font-sans text-orange-400">
                  👆 Your broker sent this — tap to review and sign
                </Text>
              : <Text className="text-xs font-sans text-orange-400">
                  👆 Tap to view and sign this document
                </Text>
            }
          </View>
        )}

        {/* NEW: Expiry warning */}
        {showExpiryWarning && doc.daysUntilExpiry !== null && (
          <View className="mt-2 pt-2 border-t border-orange-500/15 flex-row items-center gap-1.5">
            <Text className="text-xs font-sans text-orange-400">
              ⚠️ Expires in {doc.daysUntilExpiry} day{doc.daysUntilExpiry !== 1 ? 's' : ''} — sign soon
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Create LOA Modal ──────────────────────────────────────────────
// NEW: Instead of simple Alert, shows a form with supplier + fuelType

const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'any',         label: '⚡🔥 All Energy (Default)' },
  { value: 'electricity', label: '⚡ Electricity Only' },
  { value: 'gas',         label: '🔥 Gas Only' },
  { value: 'dual',        label: '⚡🔥 Dual Fuel' },
];

function CreateLOAModal({
  visible,
  onClose,
  onSubmit,
  isCreating,
}: {
  visible:    boolean;
  onClose:    () => void;
  onSubmit:   (payload: CreateDocumentPayload) => void;
  isCreating: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [supplier, setSupplier] = React.useState('');
  const [fuelType, setFuelType] = React.useState<FuelType>('any');

  const handleSubmit = () => {
    onSubmit({
      type:     'loa',
      supplier: supplier.trim() || null,
      fuelType,
    });
  };

  const handleClose = () => {
    setSupplier('');
    setFuelType('any');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={handleClose}>
        <Pressable onPress={() => {}}>
          <View className="bg-card rounded-t-3xl px-5 pt-5 pb-10 border-t border-border">

            {/* Handle bar */}
            <View className="w-10 h-1 bg-border rounded-full self-center mb-5" />

            <Text className="text-lg font-bold text-brand dark:text-brand-fg mb-1">
              New Letter of Authority
            </Text>
            <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-5 leading-5">
              Create an LOA so our team can compare energy deals on your behalf.
              Optionally specify a supplier and fuel type.
            </Text>

            {/* Supplier input */}
            <Text className="text-xs font-semibold text-[#4A6A82] dark:text-brand-fg-muted mb-1.5 uppercase tracking-wider">
              Supplier (optional)
            </Text>
            <TextInput
              value={supplier}
              onChangeText={setSupplier}
              placeholder="e.g. British Gas, Octopus Energy…"
              placeholderTextColor={isDark ? '#4A6A82' : '#8BA8C4'}
              className="bg-background border border-border rounded-banner h-11 px-3.5 mb-4 text-sm"
              style={{ color: isDark ? '#F0F8FF' : '#0D2C40' }}
              autoCapitalize="words"
              returnKeyType="done"
            />

            {/* Fuel type selector */}
            <Text className="text-xs font-semibold text-[#4A6A82] dark:text-brand-fg-muted mb-1.5 uppercase tracking-wider">
              Fuel Type
            </Text>
            <View className="gap-2 mb-6">
              {FUEL_OPTIONS.map((opt) => {
                const isSelected = fuelType === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setFuelType(opt.value)}
                    className={[
                      'flex-row items-center gap-3 px-3.5 py-3 rounded-banner border',
                      isSelected
                        ? 'bg-primary/8 border-primary/40'
                        : 'bg-background border-border',
                    ].join(' ')}
                  >
                    <View className={[
                      'w-4 h-4 rounded-full border-2',
                      isSelected ? 'border-primary bg-primary' : 'border-border bg-transparent',
                    ].join(' ')} />
                    <Text className={`text-sm ${isSelected ? 'font-semibold text-primary' : 'font-sans text-brand dark:text-brand-fg'}`}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={isCreating}
              className="bg-primary h-12 rounded-banner items-center justify-center flex-row gap-2"
              style={{ opacity: isCreating ? 0.7 : 1 }}
            >
              {isCreating
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                    </Svg>
                    <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Create LOA</Text>
                  </>
              }
            </Pressable>

            <Pressable onPress={handleClose} className="items-center mt-3 py-2">
              <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Empty state ───────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-2xl bg-primary/8 items-center justify-center border border-primary/20 mb-4">
        <Text style={{ fontSize: 32 }}>📁</Text>
      </View>
      <Text className="text-base font-bold text-brand dark:text-brand-fg text-center mb-1.5">
        {filter === 'all' ? 'No documents yet' : `No ${filter} documents`}
      </Text>
      <Text className="text-sm font-sans text-center leading-relaxed text-[#4A6A82] dark:text-brand-fg-muted">
        {filter === 'all'
          ? 'Your energy bills, contracts and Letters of Authority will appear here.'
          : `You have no ${filter} documents at the moment.`}
      </Text>
    </View>
  );
}

// ─── FAB ──────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle} className="absolute bottom-6 right-5">
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.92, { damping: 12 }, () => {
            scale.value = withSpring(1, { damping: 14 });
          });
          onPress();
        }}
        className="flex-row items-center gap-2 bg-primary rounded-full px-5 py-3.5"
        style={{
          shadowColor: '#2272A6', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
        }}
      >
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
        <Text style={{ color: '#ffffff' }} className="text-sm font-bold">New LOA</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function DocumentsIndexScreen() {
  const {
    documents, pagination, isLoadingList, isCreating,
    loadDocuments, createDocument,
  } = useDocumentStore();

  const [activeFilter,   setActiveFilter]   = React.useState<DocumentStatus | 'all'>('all');
  const [refreshing,     setRefreshing]     = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const fetch = React.useCallback(
    (filter: DocumentStatus | 'all' = activeFilter) =>
      loadDocuments(filter === 'all' ? { limit: 30 } : { status: filter, limit: 30 }),
    [activeFilter]
  );

  React.useEffect(() => { fetch(); }, []);

  const handleFilter = (f: DocumentStatus | 'all') => {
    setActiveFilter(f);
    loadDocuments(f === 'all' ? { limit: 30 } : { status: f, limit: 30 });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  const handleCreateSubmit = async (payload: CreateDocumentPayload) => {
    try {
      const doc = await createDocument(payload);
      setShowCreateModal(false);
      router.push(`/(app)/documents/${doc._id}` as any);
    } catch (e: any) {
      setShowCreateModal(false);
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not create document.');
    }
  };

  const signedCount   = documents.filter((d) => d.status === 'signed').length;
  const pendingCount  = documents.filter((d) => d.status === 'pending_signature').length;
  const brokerSentCount = documents.filter((d) => d.sentByAdmin && d.status === 'pending_signature').length;

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-4 px-5">

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold text-brand-fg">Documents</Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
              {pagination
                ? `${pagination.total} document${pagination.total !== 1 ? 's' : ''}`
                : 'Letters of Authority & contracts'}
            </Text>
          </View>
        </View>

        {/* Quick stats */}
        {(signedCount > 0 || pendingCount > 0 || brokerSentCount > 0) && (
          <View className="flex-row gap-2 mb-3 flex-wrap">
            {pendingCount > 0 && (
              <View className="bg-orange-500/15 border border-orange-500/25 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-orange-400">{pendingCount}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Pending</Text>
              </View>
            )}
            {signedCount > 0 && (
              <View className="bg-brand-teal/10 border border-brand-teal/20 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-brand-teal">{signedCount}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Signed</Text>
              </View>
            )}
            {/* NEW: broker-sent pending indicator */}
            {brokerSentCount > 0 && (
              <View className="bg-primary/15 border border-primary/25 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-brand-blue-bright">{brokerSentCount}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">From Broker</Text>
              </View>
            )}
            <View className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 items-center">
              <Text className="text-base font-bold text-brand-fg">{documents.length}</Text>
              <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Total</Text>
            </View>
          </View>
        )}

        {/* Info strip */}
        <View className="bg-primary/13 rounded-xl px-3 py-2.5 mb-3 flex-row items-start gap-2 border border-primary/20">
          <Text style={{ fontSize: 14 }}>ℹ️</Text>
          <Text className="text-xs font-sans flex-1 leading-4 text-brand-fg-muted">
            A Letter of Authority lets our team compare energy deals and manage switching on your behalf.
          </Text>
        </View>

        {/* Filter tabs */}
        <View className="flex-row -mb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => handleFilter(tab.id)}
                className="flex-1 items-center py-2"
              >
                <Text
                  className={[
                    'text-xs',
                    isActive ? 'font-semibold text-brand-fg' : 'font-sans text-brand-fg-muted',
                  ].join(' ')}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View className="absolute bottom-0 h-0.5 w-4/5 bg-brand-blue-bright rounded-sm" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Content ── */}
      {isLoadingList && documents.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2272A6" />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <DocumentCard doc={item} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 80, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2272A6" />
          }
          ListEmptyComponent={<EmptyState filter={activeFilter} />}
        />
      )}

      {/* ── FAB ── */}
      <FAB onPress={() => setShowCreateModal(true)} />

      {/* ── Create LOA modal ── */}
      <CreateLOAModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        isCreating={isCreating}
      />
    </View>
  );
}