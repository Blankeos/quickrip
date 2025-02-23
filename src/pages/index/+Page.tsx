import { DownloadArgumentsForm } from '@/components/download-arguments-form';
import { useDownloadArguments } from '@/hooks/use-download-arguments';
import { invoke } from '@tauri-apps/api/core';
// import { open } from '@tauri-apps/api/shell';
import { createSignal, For, onMount, Show } from 'solid-js';
import { toast } from 'solid-sonner';

interface DownloadItem {
  id: string;
  url: string;
  title: string;
  progress: number;
  status: 'downloading' | 'completed' | 'error';
  filePath: string;
}

interface DownloadResult {
  status: 'success' | 'error';
  message: string;
}

export default function Page() {
  const [url, setUrl] = createSignal('');
  const [downloads, setDownloads] = createSignal<DownloadItem[]>([]);

  const [ytDlpInstallPath, setYtDlpInstallPath] = createSignal<string>();
  const [isInstallingYtDlp, setIsInstallingYtDlp] = createSignal(false);

  const [showDownloadArguments, setShowDownloadArguments] = createSignal(false);
  const { currentDownloadArguments, setCurrentDownloadArguments } = useDownloadArguments();

  async function checkYtDlpInstallation() {
    try {
      const installPath: string | undefined = await invoke('get_ytdlp_path');
      setYtDlpInstallPath(installPath);
    } catch (error) {
      console.error('Failed to check yt-dlp installation:', error);
      setYtDlpInstallPath(undefined);
    }
  }

  async function startDownload(e: Event) {
    e.preventDefault();

    if (!url()) return;

    // Create a new download item
    const newDownload: DownloadItem = {
      id: Date.now().toString(),
      url: url(),
      title: 'Loading...', // This would be updated with actual title
      progress: 0,
      status: 'downloading',
      filePath: '',
    };

    setDownloads((prev) => [newDownload, ...prev]);
    const downloadUrl = url();
    setUrl('');

    try {
      console.log('will download', downloadUrl);
      const result = await invoke<string>('download_video', { url: downloadUrl });

      setDownloads((prev) =>
        prev.map((item) =>
          item.id === newDownload.id
            ? { ...item, title: 'Idk basta downloaded', status: 'completed', progress: 100 }
            : item
        )
      );

      // Show success toast
      toast.success('Video downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      // Show error toast
      toast.error('Failed to download video. Please try again.');
      setDownloads((prev) =>
        prev.map((item) => (item.id === newDownload.id ? { ...item, status: 'error' } : item))
      );
    }
  }

  async function installYtDlp() {
    setIsInstallingYtDlp(true);
    try {
      await invoke('download_ytdlp');
      checkYtDlpInstallation();
    } catch (error) {
      console.error('Failed to install yt-dlp:', error);
    } finally {
      setIsInstallingYtDlp(false);
    }
  }

  async function openInFinder(filePath: string) {
    // await open(filePath);
  }

  onMount(() => {
    checkYtDlpInstallation();
  });

  return (
    <div class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      {/* <Show
        when={ytDlpInstallPath()}
        fallback={
          <button
            onClick={installYtDlp}
            disabled={isInstallingYtDlp()}
            class="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:bg-green-800"
          >
            {isInstallingYtDlp() ? 'Installing yt-dlp...' : 'Install yt-dlp'}
          </button>
        }
      >
        <span class="flex items-center gap-2 text-green-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          yt-dlp is installed
        </span>
      </Show> */}
      <h1 class="text-center text-2xl font-bold">YouTube Downloader</h1>
      {/* Input Form */}
      <form onSubmit={startDownload} class="flex flex-col gap-y-2">
        <div class="flex gap-2">
          <input
            type="text"
            value={url()}
            onInput={(e) => setUrl(e.currentTarget.value)}
            placeholder="Paste YouTube URL here..."
            class="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-white outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            class="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            disabled={!url()}
          >
            Download
          </button>
        </div>

        <div class="relative">
          <button
            type="button"
            class="rounded-lg bg-green-500 px-4 py-2 text-white"
            onClick={() => setShowDownloadArguments(!showDownloadArguments())}
          >
            Arguments
          </button>

          <Show when={showDownloadArguments()}>
            <DownloadArgumentsForm
              currentDownloadArguments={currentDownloadArguments}
              setCurrentDownloadArguments={setCurrentDownloadArguments}
            />
          </Show>
        </div>
      </form>
      {/* Downloads List */}
      <div class="flex flex-col gap-2">
        <h2 class="text-lg font-semibold">Downloads</h2>
        <div class="flex flex-col gap-2">
          <For each={downloads()}>
            {(item) => (
              <div
                class="flex cursor-pointer flex-col gap-2 rounded-lg bg-neutral-900 p-4 hover:bg-neutral-800"
                onDblClick={() => item.status === 'completed' && openInFinder(item.filePath)}
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium">{item.title}</span>
                  <span
                    class={`text-sm ${
                      item.status === 'completed'
                        ? 'text-green-500'
                        : item.status === 'error'
                          ? 'text-red-500'
                          : 'text-blue-500'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Progress Bar */}
                {item.status === 'downloading' && (
                  <div class="h-2 w-full rounded-full bg-neutral-700">
                    <div
                      class="h-2 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
