import { useEffect, useEffectEvent, useState } from 'react';

import { StyleSheet, Text } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Card, Header, Screen } from '@/components/screen';
import { ErrorState, LoadingState } from '@/components/state-view';
import { useAuth } from '@/contexts/auth-context';
import { getMe, updateMe, type BackendUser } from '@/services/mygymApi';

export default function ProfileScreen() {
  const { backendUser, refreshBackendUser, signOut } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const [form, setForm] = useState({ email: '', name: '', photo_url: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<BackendUser | null>(backendUser);

  const fillForm = (user: BackendUser | null) => {
    setForm({
      email: user?.email || '',
      name: user?.name || '',
      photo_url: user?.photo_url || '',
    });
  };

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextProfile = await getMe();
      setProfile(nextProfile);
      fillForm(nextProfile);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfileOnMount = useEffectEvent(loadProfile);

  const saveProfile = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const nextProfile = await updateMe(form);
      setProfile(nextProfile);
      fillForm(nextProfile);
      await refreshBackendUser();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError : new Error(String(caughtError)));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProfileOnMount();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Screen>
      <Header subtitle="Perfil" title="Seus dados" />

      <Card>
        {isLoading && <LoadingState message="Carregando perfil..." />}
        {error && <ErrorState message={error.message} />}
        {profile && <Text style={styles.profileId}>ID interno: {profile.id}</Text>}
        <FormField label="Nome" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
        <FormField
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          value={form.email}
          onChangeText={(email) => setForm({ ...form, email })}
        />
        <FormField
          autoCapitalize="none"
          label="Foto URL"
          value={form.photo_url}
          onChangeText={(photo_url) => setForm({ ...form, photo_url })}
        />
        <ActionButton disabled={isSaving} onPress={() => void saveProfile()}>
          {isSaving ? 'Salvando...' : 'Salvar perfil'}
        </ActionButton>
      </Card>

      <ActionButton onPress={signOut} variant="danger">
        Sair
      </ActionButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileId: {
    color: '#64748B',
    fontSize: 13,
  },
});
