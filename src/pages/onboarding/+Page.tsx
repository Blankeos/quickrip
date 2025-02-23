import { IconCheckCircle } from '@/assets/icons/icons';
import { useLocalStorage } from '@/hooks/use-local-storage/use-local-storage';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { createSignal, Show } from 'solid-js';
import { toast } from 'solid-sonner';
import { navigate } from 'vike/client/router';

export default function Page() {
  const [currentSlide, setCurrentSlide] = createSignal(0);

  const [ytDlpInstallPath, setYtDlpInstallPath] = createSignal<string | undefined>(undefined);
  const [isInstallingYtDlp, setIsInstallingYtDlp] = createSignal(false);
  const [selectedDirectory, setSelectedDirectory] = createSignal<string>();
  const [_, setIsOnboardingDone] = useLocalStorage<boolean>({
    key: 'onboarding-done',
    defaultValue: false,
  });

  function goToNextSlide() {
    setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
  }

  async function checkYtDlpInstallation() {
    try {
      const installPath: string | undefined = await invoke('get_ytdlp_path');
      setYtDlpInstallPath(installPath);
      return installPath;
    } catch (error) {
      console.error('Failed to check yt-dlp installation:', error);
      setYtDlpInstallPath(undefined);
    }
    return undefined;
  }

  async function installYtDlp() {
    const existingInstallPath = await checkYtDlpInstallation();
    if (existingInstallPath) {
      // Move to next slide if yt-dlp is already installed
      setCurrentSlide(2);

      toast.success(`Already installed in ${existingInstallPath}`);
      return;
    }

    setIsInstallingYtDlp(true);
    try {
      await invoke('download_ytdlp');
      // Move to next slide after successful installation
      setCurrentSlide(2);

      const installPath = await checkYtDlpInstallation();
      toast.success(`Successfully installed yt-dlp in ${installPath}`);
    } catch (error) {
      console.error('Failed to install yt-dlp:', error);
    } finally {
      setIsInstallingYtDlp(false);
    }
  }

  const slides = [
    {
      isNextDisabled: () => false,
      onNext: () => {
        goToNextSlide();
      },
      messageNext: () => 'Next',
      heading: 'Welcome to Quickrip!',
      content: () => (
        <>
          It's a very simple app for downloading audio/video files on YouTube (or anywhere in the
          future), using a very useful CLI called{' '}
          <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" class="text-blue-500">
            yt-dlp
          </a>
          .
        </>
      ),
    },
    {
      isNextDisabled: () => !Boolean(ytDlpInstallPath()),
      onNext: () => {
        goToNextSlide();
      },
      messageNext: () => 'Next',
      heading: "Let's Get Set Up",
      content: () =>
        "To get started, let's make sure you have yt-dlp. Press this button to install it.",
      action: (
        <Show
          when={ytDlpInstallPath()}
          fallback={
            <button
              onClick={installYtDlp}
              disabled={isInstallingYtDlp()}
              class="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-800"
            >
              {isInstallingYtDlp() ? 'Installing...' : 'Install yt-dlp'}
            </button>
          }
        >
          <div class="mt-4 flex items-center gap-2 text-green-500">
            <IconCheckCircle />
            All set!
          </div>
        </Show>
      ),
    },
    {
      isNextDisabled: () => !Boolean(selectedDirectory()),
      onNext: () => {
        navigate('/');
        setIsOnboardingDone(true);
      },
      messageNext: () => 'Get Started',
      heading: 'Choose Your Download Location',
      content: () =>
        "Finally, pick a place on your system where we'll save all the downloaded files. You can change it later.",
      action: (
        <>
          <button
            onClick={async () => {
              const directory = await open({
                multiple: false,
                directory: true,
              });

              setSelectedDirectory((_) => directory ?? undefined);
            }}
            class="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Choose Folder
          </button>
          <br />

          <Show when={selectedDirectory()}>Selected Directory: {selectedDirectory()}</Show>
        </>
      ),
    },
  ];

  return (
    <div class="mx-auto flex h-screen max-w-2xl flex-col items-center justify-center p-6">
      <div class="w-full rounded-xl bg-neutral-900 p-8">
        <h1 class="mb-4 text-2xl font-bold">{slides[currentSlide()].heading}</h1>
        <p class="text-neutral-300">{slides[currentSlide()].content()}</p>

        {slides[currentSlide()].action}

        <div class="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide() === 0}
            class="rounded-lg px-4 py-2 text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            Previous
          </button>

          <div class="flex gap-2">
            {slides.map((_, index) => (
              <div
                class={`h-2 w-2 rounded-full ${
                  currentSlide() === index ? 'bg-blue-500' : 'bg-neutral-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              slides[currentSlide()]?.onNext();
            }}
            disabled={slides[currentSlide()]?.isNextDisabled?.()}
            class="rounded-lg px-4 py-2 text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            {slides[currentSlide()].messageNext()}
          </button>
        </div>
      </div>
    </div>
  );
}
