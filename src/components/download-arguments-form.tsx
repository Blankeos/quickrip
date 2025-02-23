import { useDownloadArguments } from '@/hooks/use-download-arguments';
import { open } from '@tauri-apps/plugin-dialog';

type DownloadArgumentsFormProps = ReturnType<typeof useDownloadArguments>;

export function DownloadArgumentsForm(props: DownloadArgumentsFormProps) {
  return (
    <div class="absolute right-0 mt-2 flex w-full max-w-xl flex-col gap-y-4 rounded-lg bg-neutral-900 p-4 shadow-lg">
      <div>
        <label class="block text-sm text-neutral-400">FFmpeg Location</label>
        <input
          type="text"
          value={props.currentDownloadArguments?.ffmpegLocation ?? ''}
          placeholder="/path/to/ffmpeg"
          class="w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-start"
          onInput={(e) => {
            props.setCurrentDownloadArguments('ffmpegLocation', e.currentTarget.value);
          }}
          onDblClick={async (e) => {
            const directory = await open({
              title: 'Select FFmpeg Location',
              multiple: false,
              directory: false,
            });

            if (directory)
              props.setCurrentDownloadArguments('ffmpegLocation', directory ?? undefined);
          }}
        />
      </div>

      <div>
        <label class="block text-sm text-neutral-400">YT-DLP Location</label>
        <input
          type="text"
          value={props.currentDownloadArguments?.ytDlpLocation ?? ''}
          placeholder="/path/to/yt-dlp"
          class="w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-start"
          onInput={(e) => {
            props.setCurrentDownloadArguments('ytDlpLocation', e.currentTarget.value);
          }}
          onDblClick={async (e) => {
            const directory = await open({
              title: 'Select YT-DLP Location',
              multiple: false,
              directory: false,
            });

            if (directory)
              props.setCurrentDownloadArguments('ytDlpLocation', directory || undefined);
          }}
        />
      </div>

      <div>
        <label class="block text-sm text-neutral-400">Save Path</label>
        <input
          type="text"
          value={props.currentDownloadArguments?.savePath ?? ''}
          placeholder="/path/to/save-dir"
          class="w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-start"
          onInput={(e) => {
            props.setCurrentDownloadArguments('savePath', e.currentTarget.value);
          }}
          onDblClick={async (e) => {
            const directory = await open({
              title: 'Select Save Path',
              multiple: false,
              directory: true,
            });

            if (directory) props.setCurrentDownloadArguments('savePath', directory ?? undefined);
          }}
        />
      </div>
      <div class="flex items-center gap-x-2">
        <input
          id="convert-to-audio"
          type="checkbox"
          checked={props.currentDownloadArguments?.convertToAudio ?? false}
          onChange={(e) =>
            props.setCurrentDownloadArguments('convertToAudio', e.currentTarget.checked)
          }
        />
        <label class="block text-sm text-neutral-400 select-none" for="convert-to-audio">
          Convert to Audio
        </label>
      </div>

      <div>
        <label class="block text-sm text-neutral-400">Audio Format</label>
        <input
          type="text"
          value={props.currentDownloadArguments?.audioFormat ?? ''}
          placeholder="mp3, m4a, wav, etc."
          class="w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1"
          onInput={(e) => props.setCurrentDownloadArguments('audioFormat', e.currentTarget.value)}
        />
      </div>

      <div>
        <label class="block text-sm text-neutral-400">Audio Quality</label>
        <input
          type="text"
          value={props.currentDownloadArguments?.audioQuality ?? ''}
          placeholder="0-9 (best)"
          class="w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1"
          onInput={(e) => props.setCurrentDownloadArguments('audioQuality', e.currentTarget.value)}
        />
      </div>
    </div>
  );
}
