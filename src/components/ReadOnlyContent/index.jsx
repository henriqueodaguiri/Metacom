"use client";
import { ContentDisplay } from "./styles";

export function ReadOnlyContent({ content }) {
  return (
    <ContentDisplay dangerouslySetInnerHTML={{ __html: content }} />
  );
}
