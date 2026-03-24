import { Text } from '@/components/ui/text';
import { useDocumentStore } from '@/lib/store/document.store';
import type { FuelType, DocumentType } from '@/lib/types/document.types';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ─── Fuel label helper ─────────────────────────────────────────────
const FUEL_LABELS: Record<FuelType, string> = {
  electricity: '⚡ Electricity Only',
  gas:         '🔥 Gas Only',
  dual:        '⚡🔥 Dual Fuel',
  any:         'All Energy',
};

// ─── Document type label helper ────────────────────────────────────
const TYPE_LABELS: Record<DocumentType, string> = {
  loa:             'Letter of Authority',
  contract:        'Energy Contract',
  bill:            'Energy Bill',
  vat_declaration: 'VAT Declaration',
  other:           'Document',
};

// ─── Document type icon helper ─────────────────────────────────────
const TYPE_ICONS: Record<DocumentType, string> = {
  loa:             '📋',
  contract:        '📑',
  bill:            '🧾',
  vat_declaration: '⚖️',
  other:           '📄',
};

// ─── Signature pad ─────────────────────────────────────────────────
// Zero extra packages — PanResponder + SVG → base64 SVG data URI

interface Point { x: number; y: number }

function SignaturePad({
  onSign,
  onClear,
  isSigning,
}: {
  onSign:    (base64: string) => void;
  onClear:   () => void;
  isSigning: boolean;
}) {
  const [paths,    setPaths]    = React.useState<Point[][]>([]);
  const [current,  setCurrent]  = React.useState<Point[]>([]);
  const [hasLines, setHasLines] = React.useState(false);

  const allPaths = [...paths, current].filter((p) => p.length > 0);

  const pointsToPath = (pts: Point[]): string => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x + 0.1} ${pts[0].y}`;
    const [first, ...rest] = pts;
    return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
  };

  const buildBase64 = (): string => {
    const svgContent = allPaths
      .map((pts) => `<path d="${pointsToPath(pts)}" stroke="black" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)
      .join('');
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120">${svgContent}</svg>`;
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      setCurrent([{ x, y }]);
      setHasLines(true);
    },
    onPanResponderMove: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      setCurrent((prev) => [...prev, { x, y }]);
    },
    onPanResponderRelease: () => {
      setPaths((prev) => [...prev, current]);
      setCurrent([]);
    },
  });

  const handleClear = () => {
    setPaths([]); setCurrent([]); setHasLines(false); onClear();
  };

  const handleSign = () => {
    if (!hasLines) {
      Alert.alert('Signature required', 'Please draw your signature in the box before signing.');
      return;
    }
    onSign(buildBase64());
  };

  return (
    <View className="gap-3">
      <View
        className="bg-white dark:bg-card border-2 border-dashed border-primary/40 rounded-xl overflow-hidden"
        style={{ height: 140 }}
        {...panResponder.panHandlers}
      >
        <View
          className="absolute left-10 right-10 border-b border-dashed border-[#4A6A82]/30"
          style={{ top: 100 }}
          pointerEvents="none"
        />
        <Text
          className="absolute text-xs font-sans text-[#4A6A82]/40 dark:text-brand-fg-muted"
          style={{ left: 12, top: 12 }}
          pointerEvents="none"
        >
          Sign here
        </Text>
        <Svg
          width="100%" height="100%" viewBox="0 0 320 140"
          style={{ position: 'absolute', top: 0, left: 0 }}
          pointerEvents="none"
        >
          {allPaths.map((pts, i) => (
            <Path
              key={i} d={pointsToPath(pts)}
              stroke="#0D2C40" strokeWidth="2.5" fill="none"
              strokeLinecap="round" strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>

      <View className="flex-row gap-2.5">
        <Pressable
          onPress={handleClear}
          className="flex-1 h-11 rounded-banner border border-border bg-card items-center justify-center"
        >
          <Text className="text-sm font-semibold text-[#4A6A82] dark:text-brand-fg-muted">Clear</Text>
        </Pressable>

        <Pressable
          onPress={handleSign}
          disabled={isSigning || !hasLines}
          className={[
            'flex-[2] h-11 rounded-banner items-center justify-center flex-row gap-2',
            !hasLines ? 'bg-brand-selected' : 'bg-primary',
            isSigning ? 'opacity-70' : 'opacity-100',
          ].join(' ')}
        >
          {isSigning
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Sign Document</Text>
              </>
          }
        </Pressable>
      </View>
    </View>
  );
}

// ─── Info row ──────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between items-start py-2.5 border-b border-border">
      <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted flex-1 mr-4">
        {label}
      </Text>
      <Text className="text-sm font-medium text-brand dark:text-brand-fg flex-1 text-right">
        {value}
      </Text>
    </View>
  );
}

// ─── Authorised actions ────────────────────────────────────────────

function AuthorisedActions({ supplier, fuelType }: { supplier?: string | null; fuelType?: FuelType }) {
  const supplierText = supplier ? `with ${supplier}` : 'with UK energy suppliers';
  const fuelText     = fuelType && fuelType !== 'any'
    ? ` (${fuelType} only)`
    : '';

  const actions = [
    `Obtain energy quotes on your behalf ${supplierText}${fuelText}`,
    'Contact suppliers to get current rate and tariff information',
    'Initiate the energy switching process on your behalf',
    'Access your meter point data (MPAN/MPRN)',
    'Receive supplier correspondence on your behalf',
  ];

  return (
    <View className="gap-2">
      {actions.map((a, i) => (
        <View key={i} className="flex-row items-start gap-2.5">
          <View className="w-5 h-5 rounded-full bg-primary/13 items-center justify-center mt-0.5">
            <Svg width="10" height="10" viewBox="0 0 10 10">
              <Path d="M2 5l2.5 2.5L8 2.5" fill="none" stroke="#2272A6"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text className="text-sm font-sans flex-1 leading-5 text-brand dark:text-brand-fg">{a}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Signed success banner ─────────────────────────────────────────

function SignedBanner({ signedAt, pdfUrl }: { signedAt?: string | null; pdfUrl?: string | null }) {
  const scale   = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withSpring(1, { damping: 16 });
    scale.value   = withSpring(1,  { damping: 14 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value, transform: [{ scale: scale.value }],
  }));

  const handleDownload = async () => {
    if (!pdfUrl) {
      Alert.alert('PDF not available', 'PDF is being generated. Please check back shortly.');
      return;
    }
    try { await Linking.openURL(pdfUrl); }
    catch { Alert.alert('Error', 'Could not open PDF. Please try again.'); }
  };

  return (
    <Animated.View style={animStyle}>
      <View className="bg-brand-teal/8 rounded-card p-4 border border-brand-teal/25 mb-3">
        <View className="flex-row items-start gap-3 mb-3">
          <View className="w-10 h-10 rounded-full bg-brand-teal/15 items-center justify-center">
            <Text style={{ fontSize: 20 }}>✅</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-brand-teal mb-0.5">Document Signed!</Text>
            {signedAt && (
              <Text className="text-xs font-sans text-brand-teal/70">
                Signed on {new Date(signedAt).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
            )}
          </View>
        </View>
        <Text className="text-sm font-sans text-brand dark:text-brand-fg mb-3 leading-5">
          Your Letter of Authority has been signed and is legally valid.
          Our team can now act on your behalf with energy suppliers.
        </Text>
        <Pressable
          onPress={handleDownload}
          className="bg-brand-teal/10 border border-brand-teal/30 h-11 rounded-banner items-center justify-center flex-row gap-2"
        >
          <Text style={{ fontSize: 14 }}>📥</Text>
          <Text className="text-sm font-semibold text-brand-teal">
            Download PDF Copy
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function DocumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selectedDocument, isLoadingDetail, isSigning,
    loadDocument, signDocument, deleteDocument,
  } = useDocumentStore();

  const [signError,  setSignError]  = React.useState('');
  const [justSigned, setJustSigned] = React.useState<{ pdfUrl: string | null } | null>(null);

  const contentOpacity = useSharedValue(0);
  const contentY       = useSharedValue(24);

  React.useEffect(() => {
    if (id) loadDocument(id);
  }, [id]);

  React.useEffect(() => {
    if (selectedDocument) {
      contentOpacity.value = withDelay(80, withTiming(1, { duration: 350 }));
      contentY.value       = withDelay(80, withSpring(0, { damping: 18 }));
    }
  }, [selectedDocument]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  if (isLoadingDetail) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  if (!selectedDocument) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8 gap-3">
        <Text className="text-base font-semibold text-brand dark:text-brand-fg">Document not found</Text>
        <Pressable onPress={() => router.back()} className="bg-primary rounded-banner px-5 py-2.5">
          <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const doc       = selectedDocument;
  const isPending = doc.status === 'pending_signature';
  const isSigned  = doc.status === 'signed';
  const isExpired = doc.status === 'expired';

  const handleSign = async (base64Sig: string) => {
    setSignError('');
    try {
      const result = await signDocument(doc._id, { signature: base64Sig });
      setJustSigned({ pdfUrl: result.pdfUrl });
    } catch (e: any) {
      setSignError(e?.response?.data?.message ?? 'Signing failed. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Delete this unsigned document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(doc._id);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Could not delete document.');
            }
          },
        },
      ]
    );
  };

  const expiresDate = doc.expiresAt
    ? new Date(doc.expiresAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null;

  const createdDate = new Date(doc.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // Expiry urgency: warn if < 14 days
  const expiryUrgent = doc.daysUntilExpiry !== null && doc.daysUntilExpiry <= 14 && isPending;

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-5 px-5">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-1.5 mb-4">
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#7AAEC8"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">Documents</Text>
        </Pressable>

        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            {/* Doc number + status */}
            <View className="flex-row items-center gap-2 mb-1 flex-wrap">
              <Text className="text-xs font-bold text-brand-blue-bright">{doc.docNumber}</Text>

              {isSigned && (
                <View className="bg-brand-teal/8 border border-brand-teal/25 rounded-full px-2 py-0.5">
                  <Text className="text-xs font-semibold text-brand-teal">✅ Signed</Text>
                </View>
              )}
              {isPending && (
                <View className="bg-orange-500/15 border border-orange-500/25 rounded-full px-2 py-0.5">
                  <Text className="text-xs font-semibold text-orange-400">✍️ Awaiting Signature</Text>
                </View>
              )}
              {isExpired && (
                <View className="bg-muted dark:bg-border/20 rounded-full px-2 py-0.5">
                  <Text className="text-xs font-semibold text-[#4A6A82] dark:text-brand-fg-muted">⏰ Expired</Text>
                </View>
              )}

              {/* NEW: Sent by broker tag */}
              {doc.sentByAdmin && (
                <View className="bg-primary/20 border border-primary/30 rounded-full px-2 py-0.5">
                  <Text className="text-xs font-semibold text-brand-blue-bright">📩 From Broker</Text>
                </View>
              )}
            </View>

            <Text className="text-xl font-bold text-brand-fg">{doc.title}</Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">Created {createdDate}</Text>

            {/* NEW: Supplier + fuelType row */}
            {(doc.supplier || (doc.fuelType && doc.fuelType !== 'any')) && (
              <View className="flex-row flex-wrap gap-1.5 mt-2">
                {doc.supplier && (
                  <View className="bg-primary/15 rounded-lg px-2 py-0.5">
                    <Text className="text-xs font-semibold text-brand-blue-bright">🏢 {doc.supplier}</Text>
                  </View>
                )}
                {doc.fuelType && doc.fuelType !== 'any' && (
                  <View className="bg-primary/15 rounded-lg px-2 py-0.5">
                    <Text className="text-xs font-semibold text-brand-blue-bright">
                      {doc.fuelType === 'electricity' ? '⚡' : doc.fuelType === 'gas' ? '🔥' : '⚡🔥'} {doc.fuelType}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View className="w-12 h-12 rounded-xl bg-primary/13 border border-primary/25 items-center justify-center flex-shrink-0">
            <Text style={{ fontSize: 24 }}>{TYPE_ICONS[doc.type] || '📄'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={animStyle} className="gap-3">

          {/* ── Just signed ── */}
          {justSigned && (
            <SignedBanner signedAt={doc.signature?.signedAt} pdfUrl={justSigned.pdfUrl} />
          )}

          {/* ── NEW: Broker description (if sentByAdmin) ── */}
          {doc.sentByAdmin && doc.description && !justSigned && (
            <View className="bg-primary/8 rounded-card p-4 border border-primary/20">
              <View className="flex-row items-center gap-2 mb-2">
                <Text style={{ fontSize: 16 }}>📩</Text>
                <Text className="text-sm font-bold text-brand dark:text-brand-fg">Message from your broker</Text>
              </View>
              <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted leading-5 italic">
                "{doc.description}"
              </Text>
            </View>
          )}

          {/* ── NEW: Expiry urgency warning ── */}
          {expiryUrgent && doc.daysUntilExpiry !== null && (
            <View className="bg-orange-500/10 rounded-card p-4 border border-orange-500/20">
              <View className="flex-row items-center gap-2">
                <Text style={{ fontSize: 16 }}>⚠️</Text>
                <Text className="text-sm font-bold text-orange-400">
                  Expires in {doc.daysUntilExpiry} day{doc.daysUntilExpiry !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text className="text-sm font-sans text-orange-300 mt-1 leading-5">
                Sign this document before it expires, or a new one will need to be created.
              </Text>
            </View>
          )}

          {/* ── Already signed banner ── */}
          {isSigned && !justSigned && (
            <View className="bg-brand-teal/8 rounded-card p-4 border border-brand-teal/20">
              <View className="flex-row items-center gap-2 mb-2">
                <Text style={{ fontSize: 18 }}>✅</Text>
                <Text className="text-sm font-bold text-brand-teal">
                  {doc.type === 'bill' ? 'This bill is verified' : 'This document is signed'}
                </Text>
              </View>
              {doc.signature?.signedAt && (
                <Text className="text-xs font-sans text-brand-teal/80 mb-3">
                  Signed on {new Date(doc.signature.signedAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </Text>
              )}
              {doc.pdf?.url
                ? (
                  <Pressable
                    onPress={async () => {
                      try { await Linking.openURL(doc.pdf!.url!); }
                      catch { Alert.alert('Error', 'Could not open PDF.'); }
                    }}
                    className="bg-brand-teal/10 border border-brand-teal/25 h-10 rounded-banner items-center justify-center flex-row gap-2"
                  >
                    <Text style={{ fontSize: 14 }}>📥</Text>
                    <Text className="text-sm font-semibold text-brand-teal">
                      {doc.type === 'bill' ? 'Download Bill' : 'Download Signed PDF'}
                    </Text>
              </Pressable>
            )
            : null
          }
        </View>
      )}

          {/* ── Expired warning ── */}
          {isExpired && (
            <View className="bg-orange-500/10 rounded-card p-4 border border-orange-500/20">
              <Text className="text-sm font-bold text-orange-400 mb-1">⏰ Document Expired</Text>
              <Text className="text-sm font-sans text-orange-300">
                This {TYPE_LABELS[doc.type]} has expired. Please contact your broker if you need a new one.
              </Text>
            </View>
          )}

          {/* ── What is this? (Dynamic) ── */}
          {doc.type === 'loa' && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-2.5">
                📋 What is this document?
              </Text>
              <Text className="text-sm font-sans leading-5 text-[#4A6A82] dark:text-brand-fg-muted mb-3">
                A Letter of Authority (LOA) gives our team permission to compare energy tariffs and
                manage your switch on your behalf. This does NOT transfer ownership of your account
                or commit you to switching.
              </Text>
              <View className="bg-primary/6 dark:bg-brand rounded-xl p-3">
                <Text className="text-xs font-semibold text-primary mb-2">
                  By signing, you authorise us to:
                </Text>
                <AuthorisedActions supplier={doc.supplier} fuelType={doc.fuelType} />
              </View>
            </View>
          )}

          {doc.type === 'contract' && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-2.5">
                📑 Energy Supply Contract
              </Text>
              <Text className="text-sm font-sans leading-5 text-[#4A6A82] dark:text-brand-fg-muted">
                This is your formal supply contract with the energy provider. Please review the terms
                carefully before signing. Once signed, this becomes a legally binding agreement between
                you and the energy supplier.
              </Text>
            </View>
          )}

          {doc.type === 'bill' && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-2.5">
                🧾 Energy Bill
              </Text>
              <Text className="text-sm font-sans leading-5 text-[#4A6A82] dark:text-brand-fg-muted">
                This is a copy of your energy bill provided by the supplier. You can download this for
                your records or to use for identity verification.
              </Text>
            </View>
          )}

          {/* ── Document details ── */}
          <View className="bg-card rounded-card p-4 border border-border">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
              Document Details
            </Text>
            <InfoRow label="Document type"   value={TYPE_LABELS[doc.type] || doc.type} />
            <InfoRow label="Document number" value={doc.docNumber} />
            {/* NEW: Supplier + fuel scope */}
            <InfoRow label="Supplier scope"  value={doc.supplier ?? 'All UK suppliers'} />
            <InfoRow
              label="Fuel scope"
              value={doc.fuelType ? (doc.fuelType === 'any' ? 'All energy' : doc.fuelType) : null}
            />
            <InfoRow label="Created"         value={createdDate} />
            <InfoRow label="Expires"         value={expiresDate} />
            {/* NEW: days until expiry */}
            {doc.daysUntilExpiry !== null && !isSigned && (
              <InfoRow
                label="Days until expiry"
                value={doc.daysUntilExpiry <= 0 ? 'Expired' : `${doc.daysUntilExpiry} days`}
              />
            )}
            <InfoRow label="Initiated by"    value={doc.sentByAdmin ? 'Your broker' : 'You'} />
            <InfoRow
              label="Status"
              value={isPending ? 'Awaiting your signature' : isSigned ? 'Signed ✅' : 'Expired'}
            />
          </View>

          {/* ── Signer details ── */}
          {(isSigned || isPending) && doc.signerDetails && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
                {isSigned ? 'Signed By' : 'Pre-filled Details'}
              </Text>
              {!isSigned && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-2 leading-4">
                  These details will be included in the LOA when you sign.
                </Text>
              )}
              <InfoRow label="Full name"       value={doc.signerDetails.fullName} />
              {/* NEW: Company name */}
              <InfoRow label="Company"         value={doc.signerDetails.companyName} />
              <InfoRow label="Email"           value={doc.signerDetails.email} />
              <InfoRow label="Phone"           value={doc.signerDetails.phone} />
              <InfoRow
                label="Address"
                value={[
                  doc.signerDetails.address?.line1,
                  doc.signerDetails.address?.city,
                  doc.signerDetails.address?.postcode,
                ].filter(Boolean).join(', ') || null}
              />
              <InfoRow label="MPAN (Elec)"     value={doc.signerDetails.mpan} />
              <InfoRow label="MPRN (Gas)"      value={doc.signerDetails.mprn} />
              <InfoRow label="Current supplier" value={doc.signerDetails.currentSupplier} />
            </View>
          )}

          {/* ── SIGNATURE SECTION ── */}
          {isPending && !isExpired && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-0.5">
                ✍️ Sign This Document
              </Text>
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-4 leading-4">
                Draw your signature in the box below. By signing, you confirm you have read and agree
                to the terms above. Your signature is legally binding under the Electronic Communications Act 2000.
              </Text>

              {signError ? (
                <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
                  <Text className="text-destructive text-xs font-sans">{signError}</Text>
                </View>
              ) : null}

              <SignaturePad onSign={handleSign} onClear={() => setSignError('')} isSigning={isSigning} />

              <Text className="text-xs font-sans text-center mt-3 leading-4 text-[#4A6A82] dark:text-brand-fg-muted">
                🔒 Your signature is stored securely. IP address and timestamp are recorded for legal validity.
              </Text>
            </View>
          )}

          {/* ── Legal disclaimer ── */}
          <View className="bg-primary/6 dark:bg-brand-selected rounded-banner p-3 border border-primary/15">
            <Text className="text-xs font-sans leading-[17px] text-[#4A6A82] dark:text-brand-fg-muted">
              This LOA is valid for 6 months from creation. You may withdraw authority at any time
              by contacting our team. Electronically signed documents are legally binding under the
              Electronic Communications Act 2000.
            </Text>
          </View>

          {/* ── Delete (pending only) ── */}
          {isPending && (
            <Pressable onPress={handleDelete} className="items-center py-3">
              <Text className="text-sm font-semibold text-destructive">Delete This Document</Text>
            </Pressable>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}