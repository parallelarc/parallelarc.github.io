import styled from "styled-components";
import {
  ContactGallery,
  PreImg,
  PreName,
  PreNameMobile,
} from "./Commands.styled";

export const BrowseShell = styled.div<{ $terminal: boolean }>`
  box-sizing: border-box;
  min-height: 100dvh;
  padding-bottom: calc(57px + env(safe-area-inset-bottom, 0px));
  background: ${({ theme }) => theme.colors?.body};
  ${({ $terminal }) =>
    $terminal &&
    `height: 100dvh; padding-bottom: env(safe-area-inset-bottom, 0px); display: flex; flex-direction: column; overflow: hidden;`}
`;

export const BrowseHeader = styled.header<{ $terminal?: boolean }>`
  position: sticky;
  top: 0;
  z-index: 20;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors?.body};
  border-bottom: 1px solid ${({ theme }) => theme.colors?.text[300]};

  > div {
    max-width: ${({ $terminal }) => ($terminal ? "none" : "760px")};
    min-height: ${({ $terminal }) => ($terminal ? "48px" : "60px")};
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  > div > span {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors?.primary};
  }

  a {
    flex-shrink: 0;
  }
`;

export const BrowseMain = styled.main<{ $terminal: boolean }>`
  box-sizing: border-box;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 20px 32px;
  min-width: 0;
  ${({ $terminal }) =>
    $terminal &&
    `flex: 1; min-height: 0; max-width: none; padding: 0; display: flex; flex-direction: column;`}

  ${ContactGallery} {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    width: 100%;
  }
`;

export const BrowseAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 44px;
  padding: 8px 10px;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  background: transparent;
  color: ${({ theme }) => theme.colors?.primary};
  cursor: pointer;
  text-decoration: none;
  touch-action: manipulation;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  &:disabled {
    color: ${({ theme }) => theme.colors?.text[300]};
    cursor: default;
  }
`;

export const BrowseNav = styled.nav`
  position: fixed;
  z-index: 30;
  left: 0;
  right: 0;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: ${({ theme }) => theme.colors?.body};
  border-top: 1px solid ${({ theme }) => theme.colors?.text[300]};

  > div {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    max-width: 760px;
    margin: 0 auto;
  }
  a {
    box-sizing: border-box;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 4px;
    border-top: 2px solid transparent;
    font-size: 13px;
    color: ${({ theme }) => theme.colors?.text[200]};
    text-decoration: none;
    touch-action: manipulation;
  }
  a[aria-current="page"] {
    color: ${({ theme }) => theme.colors?.primary};
    border-top-color: currentColor;
  }
  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: -4px;
  }
`;

export const MobileHome = styled.div`
  ${PreName}, ${PreImg}, .illu-section {
    display: none;
  }
  ${PreNameMobile} {
    display: inline-block;
  }
`;

export const BrowseHeading = styled.div`
  margin-bottom: 24px;
  h1 {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.4;
  }
  p {
    margin-top: 8px;
    font-size: 13px;
    color: ${({ theme }) => theme.colors?.text[200]};
    line-height: 1.7;
  }
`;

export const CategoryBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.text[300]};
  label {
    flex-shrink: 0;
    font-size: 13px;
    color: ${({ theme }) => theme.colors?.text[200]};
  }
  select {
    appearance: none;
    box-sizing: border-box;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 46px;
    padding: 10px 44px 10px 14px;
    background: ${({ theme }) => theme.colors?.body};
    color: ${({ theme }) => theme.colors?.text[100]};
    border: 1px solid ${({ theme }) => theme.colors?.text[300]};
    border-radius: 3px;
    font: inherit;
    font-size: 16px;
    line-height: 1.5;
  }
  select:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 2px;
  }
`;

export const CategorySelect = styled.div`
  position: relative;
  min-width: 0;
  color: ${({ theme }) => theme.colors?.text[200]};

  &::after {
    content: "";
    position: absolute;
    right: 16px;
    top: 50%;
    width: 7px;
    height: 7px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: translateY(-70%) rotate(45deg);
    pointer-events: none;
  }
`;

export const ArticleList = styled.div`
  a {
    display: block;
    padding: 22px 0;
    text-decoration: none;
    color: ${({ theme }) => theme.colors?.text[100]};
    border-bottom: 1px solid ${({ theme }) => theme.colors?.text[300]};
    touch-action: manipulation;
  }
  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors?.primary};
    outline-offset: 4px;
  }
  a:hover h2 {
    color: ${({ theme }) => theme.colors?.primary};
  }
  h2 {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
  h2 span {
    color: ${({ theme }) => theme.colors?.primary};
    margin-right: 8px;
  }
  p {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors?.text[200]};
    overflow-wrap: anywhere;
  }
`;

export const ListFooter = styled.div`
  padding: 24px 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  p {
    color: ${({ theme }) => theme.colors?.text[200]};
    font-size: 12px;
  }
  button {
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors?.text[300]};
  }
`;

export const BrowseState = styled.div`
  padding: 36px 0;
  line-height: 1.8;
  color: ${({ theme }) => theme.colors?.text[200]};
`;

export const ReaderHeader = styled.header`
  margin-bottom: 32px;
  h1 {
    margin: 20px 0 12px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  p {
    font-size: 12px;
    line-height: 1.8;
    color: ${({ theme }) => theme.colors?.text[200]};
  }
  > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

export const ArticleBody = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Microsoft YaHei", sans-serif;
  font-size: 17px;
  line-height: 1.85;
  font-weight: 400;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors?.text[100]};
  > * + * {
    margin-top: 1.2em;
  }
  h1,
  h2,
  h3,
  h4 {
    font-weight: 700;
    line-height: 1.6;
    margin-top: 1.8em;
    scroll-margin-top: 80px;
  }
  h1,
  h2 {
    font-size: 1.3em;
  }
  h3,
  h4 {
    font-size: 1.1em;
  }
  strong {
    font-weight: 700;
  }
  ul,
  ol {
    padding-left: 1.5em;
  }
  li + li {
    margin-top: 0.5em;
  }
  li > p + p {
    margin-top: 0.75em;
  }
  a {
    color: ${({ theme }) => theme.colors?.primary};
    text-underline-offset: 3px;
  }
  img {
    max-width: 100%;
    height: auto;
    border-radius: 3px;
  }
  blockquote {
    border-left: 2px solid ${({ theme }) => theme.colors?.primary};
    padding-left: 16px;
    color: ${({ theme }) => theme.colors?.text[200]};
  }
  pre {
    max-width: 100%;
    box-sizing: border-box;
    padding: 16px;
    border: 1px solid ${({ theme }) => theme.colors?.text[300]};
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.7;
  }
  code {
    font-family: "IBM Plex Mono", monospace;
    font-size: 0.85em;
  }
  :not(pre) > code {
    padding: 2px 4px;
    background: ${({ theme }) => theme.colors?.text[300]}22;
  }
  table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
    font-size: 14px;
  }
  th,
  td {
    padding: 8px 12px;
    border: 1px solid ${({ theme }) => theme.colors?.text[300]};
    min-width: 80px;
  }
  hr {
    border-top: 1px solid ${({ theme }) => theme.colors?.text[300]};
    margin: 2em 0;
  }
`;

export const ReaderFooter = styled.footer`
  margin-top: 48px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors?.text[300]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;
