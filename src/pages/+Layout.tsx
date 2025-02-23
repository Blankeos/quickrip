import { useLocalStorage } from '@/hooks/use-local-storage/use-local-storage';
import '@/styles/app.css';

import { onMount, type FlowProps } from 'solid-js';
import { Toaster } from 'solid-sonner';

import { navigate } from 'vike/client/router';

export default function RootLayout(props: FlowProps) {
  const [isOnboardingDone, setIsOnboardingDone] = useLocalStorage<false>({
    key: 'onboarding-done',
    defaultValue: false,
  });

  onMount(() => {
    if (!isOnboardingDone()) {
      navigate('/onboarding');
    }
  });
  return (
    <div>
      <nav class="flex items-center justify-center gap-x-5 py-5"></nav>
      {props.children}
      <Toaster />
    </div>
  );
}
