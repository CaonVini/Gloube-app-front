import { memo } from 'react';
import type { AddressForm, FieldErrors } from '../../domain/validators';
import { Field } from './ui';

interface Props {
  value: AddressForm;
  errors: FieldErrors<keyof AddressForm>;
  onChange: (field: keyof AddressForm, value: string) => void;
}

export const AddressFields = memo(function AddressFields({ value, errors, onChange }: Props) {
  return (
    <>
      <Field label="CEP" value={value.zipCode} error={errors.zipCode} onChangeText={(v) => onChange('zipCode', v)}
        autoComplete="postal-code" maxLength={15} />
      <Field label="Rua" value={value.street} error={errors.street} onChangeText={(v) => onChange('street', v)}
        autoComplete="street-address" maxLength={150} />
      <Field label="Número" value={value.number} error={errors.number} onChangeText={(v) => onChange('number', v)} maxLength={20} />
      <Field label="Complemento (opcional)" value={value.complement} onChangeText={(v) => onChange('complement', v)} maxLength={100} />
      <Field label="Bairro (opcional)" value={value.neighborhood} onChangeText={(v) => onChange('neighborhood', v)} maxLength={100} />
      <Field label="Cidade" value={value.city} error={errors.city} onChangeText={(v) => onChange('city', v)} maxLength={100} />
      <Field label="Estado (UF)" value={value.state} error={errors.state} onChangeText={(v) => onChange('state', v)}
        autoCapitalize="characters" maxLength={50} />
    </>
  );
});
