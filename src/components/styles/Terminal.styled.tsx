import styled, { keyframes } from "styled-components";

export const Wrapper = styled.div<{ $embedded?: boolean }>`
  position: relative;
  padding: 0.9rem 1.15rem 1.2rem;

  display: flex;
  flex-direction: column-reverse;
  box-sizing: border-box;
  height: calc(100vh - 1rem);
  height: calc(100dvh - 1rem);
  overflow-y: auto;
  background: radial-gradient(
      circle at 8% -15%,
      rgba(5, 206, 145, 0.12),
      transparent 38%
    ),
    radial-gradient(
      circle at 92% 110%,
      rgba(255, 157, 0, 0.08),
      transparent 34%
    );
  ${({ $embedded }) => $embedded && `height: 100%; min-height: 0; flex: 1;`}
`;

export const Empty = styled.div`
  margin-bottom: 0.25rem;
`;

// 历史命令块样式 - 用于区分命令和输出
export const CommandBlock = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0;
  margin-bottom: 0.12rem;
  font-family: inherit;
`;

export const Form = styled.form`
  position: sticky;
  bottom: 0;
  z-index: 5;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// Let the browser handle IME, caret movement, selection and touch editing.
export const PromptField = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: 16px;
`;

export const PromptTextarea = styled.textarea<{
  $overlayCaret: boolean;
}>`
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 1.6em;
  max-height: 168px;
  padding: 0;
  margin: 0;
  border: 0;
  outline: none;
  resize: none;
  background: transparent;
  color: ${({ theme }) => theme.colors?.text[100]};
  caret-color: ${({ $overlayCaret, theme }) =>
    $overlayCaret ? "transparent" : theme.colors?.text[100]};
  font: inherit;
  font-size: 16px;
  line-height: 1.6;
  overflow-y: auto;

  &::placeholder {
    color: ${({ theme }) => theme.colors?.text[300]};
  }
`;

const blinkCaret = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

export const BlockCaret = styled.span`
  position: absolute;
  z-index: 1;
  display: block;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
  white-space: pre;
  font: inherit;
  text-align: left;
  background: ${({ theme }) => theme.colors?.text[100]};
  color: ${({ theme }) => theme.colors?.body};
  animation: ${blinkCaret} 1s steps(1, end) infinite;
`;

export const ComposerFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0 0.5rem;

  > div[role="status"] {
    margin: 0;
    padding: 0;
    font-size: 0.75rem;

    @media (max-width: 900px) {
      display: none;
    }
  }
`;

export const ComposerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const ComposerButton = styled.button`
  min-height: 44px;
  padding: 0.25rem 0.35rem;
  font: inherit;
  font-size: 0.78rem;
  background: transparent;
  color: ${({ theme }) => theme.colors?.primary};
  cursor: pointer;
  touch-action: manipulation;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors?.text[100]};
  }

  &:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: -2px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors?.text[300]};
    cursor: default;
  }
`;

export const InputHint = styled.div`
  margin-top: 0.35rem;
  padding-left: 0.35rem;
  font-size: 0.82rem;
  color: ${({ theme }) =>
    theme.colors?.text[400] || "rgba(255, 255, 255, 0.35)"};
  opacity: 0.92;
  letter-spacing: 0.02em;
`;

// 快捷键网格布局
export const ShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 0.25rem 1.5rem;
  margin-top: 0.25rem;
  padding-left: 0.5rem;
  font-size: 0.85rem;
  color: ${({ theme }) =>
    theme.colors?.text[400] || "rgba(255, 255, 255, 0.35)"};
  opacity: 0.8;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const ShortcutItem = styled.div`
  overflow-wrap: anywhere;
`;

// A DOM command menu floats above the prompt, like a terminal suggestion list.
export const CommandsList = styled.div`
  position: absolute;
  bottom: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  max-height: min(40dvh, 20rem);
  overflow-y: auto;
  padding: 0.35rem;
  font-size: 0.84rem;
  background: ${({ theme }) => theme.colors?.body};
  border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  border-radius: 2px;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.15);
`;

export const CommandItem = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.5rem;
  font: inherit;
  text-align: left;
  cursor: pointer;
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors?.primary : theme.colors?.text[200]};
  border-radius: 2px;
  background: ${({ $selected }) =>
    $selected ? "rgba(5, 206, 145, 0.12)" : "transparent"};

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: -1px;
  }
`;

export const CommandName = styled.span`
  flex: 0 0 6.5rem;
  color: inherit;
`;

export const CommandDescription = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors?.text[200]};
`;
