import { useLocalStorageStore } from './use-local-storage';

export interface DownloadArguments {
  // App-specific
  ffmpegLocation?: string;
  ytDlpLocation?: string;
  cookies?: string;
  savePath?: string;

  // Audio Extraction
  convertToAudio?: boolean;
  audioFormat?: string;
  audioQuality?: string;
}

export function useDownloadArguments() {
  const [currentDownloadArguments, setCurrentDownloadArguments] =
    useLocalStorageStore<DownloadArguments>({
      key: 'download-arguments',
    });

  return {
    currentDownloadArguments,
    setCurrentDownloadArguments,
  };
}
