import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

type FormFieldProps = TextInputProps & {
  label: string;
};

export function FormField({ label, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#94A3B8"
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
});
