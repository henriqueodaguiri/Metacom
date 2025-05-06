"use client";
import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Container } from "./styles";

export function TextEditor({ value, onChange }) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ "header": "1"}, {"header": "2"}, { "font": [] }],
      [{ "list": "ordered"}, { "list": "bullet" }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ "color": [] }, { "background": [] }],
      [{ "align": [] }],
      ["link", "image", "video"],
      ["clean"]
    ],
  }), []);

  return (
    <Container>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="Conteúdo da leitura..."
      />
    </Container>
  );
}