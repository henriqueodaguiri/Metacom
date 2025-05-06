"use client";
import { InputWrapper} from "./styles";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/Checkbox";
import { useTheme } from "styled-components";

export function ChoiceInput({ label, value, setValue, checked, onCheck, done, isCorrect, disable = false }) {
  const theme = useTheme();
  let color = theme.COLORS.PURPLE;

  if (checked) {
    color = done ? (isCorrect ? theme.COLORS.GREEN : theme.COLORS.DARK_RED) : theme.COLORS.BLUE;
  } else if (done && isCorrect) {
    color = theme.COLORS.GREEN;
  }

  return (
    <InputWrapper>
      <Input 
        placeholder={label}
        borderColor={color}
        value={value}
        onChange={e => setValue(e.target.value)}
        {...(disable && { disabled: true })}
      />
      <Checkbox checked={checked} onChange={onCheck} disabled={done}/>
    </InputWrapper>
  );
}