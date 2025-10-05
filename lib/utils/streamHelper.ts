import { ProcessingProgress } from '@/types/results';

export function createSSEStream(): { stream: ReadableStream; push: (data: ProcessingProgress) => void; close: () => void } {
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
    cancel() {
      controller = null;
    }
  });

  const push = (data: ProcessingProgress) => {
    if (controller) {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      controller.enqueue(new TextEncoder().encode(message));
    }
  };

  const close = () => {
    if (controller) {
      controller.close();
    }
  };

  return { stream, push, close };
}

export function formatSSEMessage(data: any): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}
