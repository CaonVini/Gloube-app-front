import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildComparison } from '../../domain/discover/compare';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { fonts } from '../theme/auth-theme';
import { Tag, dc } from './ui';

/** Detalhes de um destino em folha sobre o deck: abrir e fechar não muda o card atual nem os favoritos. */
export function DetailsSheet({ rec, onClose }: { rec: Recommendation | null; onClose: () => void }) {
  const rows = rec ? buildComparison([rec]) : [];
  return (
    <Modal transparent visible={!!rec} animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Fechar detalhes">
        <Pressable style={s.sheet} onPress={() => {}}>
          {rec ? (
            <>
              <View style={s.grab} />
              <Text style={s.title} accessibilityRole="header">{rec.destination.name}</Text>
              <Text style={s.country}>{rec.destination.country}</Text>
              <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                <Text style={s.desc}>{rec.destination.description}</Text>
                <View style={s.tags}>
                  {rec.destination.experiences.map((e) => <Tag key={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</Tag>)}
                </View>
                <Text style={s.h}>Por que combina com você</Text>
                <Text style={s.desc}>{rec.why}</Text>
                <Text style={s.h}>Estimativas (fictícias, por pessoa)</Text>
                {rows.map((r) => (
                  <View key={r.label} style={s.row}>
                    <Text style={s.rowLabel}>{r.label}</Text>
                    <Text style={[s.rowValue, (r.values[0] ?? '').startsWith('Confirme') && s.warn]}>{r.values[0]}</Text>
                  </View>
                ))}
                <Text style={s.note}>A estimativa inclui passagem de ida e volta, hospedagem, alimentação e passeios.</Text>
              </ScrollView>
              <PrimaryButton title="Fechar" onPress={onClose} size="hero" />
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(11,20,17,0.45)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '85%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, gap: 8, width: '100%', maxWidth: 512, alignSelf: 'center' },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D9DDDA', marginBottom: 6 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: dc.dark },
  country: { fontFamily: fonts.medium, fontSize: 15, color: dc.teal },
  scroll: { flexGrow: 0 },
  desc: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#2B2F2E', marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  h: { fontFamily: fonts.bold, fontSize: 16, color: dc.dark, marginTop: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E1E3E0' },
  rowLabel: { fontFamily: fonts.regular, fontSize: 14, color: dc.muted, flex: 1 },
  rowValue: { fontFamily: fonts.semibold, fontSize: 14, color: dc.dark, flex: 1, textAlign: 'right' },
  warn: { color: '#8A6100' },
  note: { fontFamily: fonts.regular, fontSize: 12, color: dc.muted, marginVertical: 10 },
});
