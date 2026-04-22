export type TypewriterOptions = {
  text: string;
  typingSpeed?: number;
  holdTime?: number;
  restartDelay?: number;
  onUpdate: (value: string) => void;
  shouldContinue?: () => boolean;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function runTypewriterIteration({
  text,
  typingSpeed = 80,
  holdTime = 2000,
  restartDelay = 500,
  onUpdate,
  shouldContinue = () => true
}: TypewriterOptions): Promise<void> {
  for (let i = 1; i <= text.length; i++) {
    if (!shouldContinue()) return;
    onUpdate(text.slice(0, i));
    await wait(typingSpeed);
  }

  if (!shouldContinue()) return;
  await wait(holdTime);

  if (!shouldContinue()) return;
  onUpdate('');

  if (!shouldContinue()) return;
  await wait(restartDelay);
}