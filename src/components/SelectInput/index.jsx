"use client";
import { Container } from "./styles";

export function SelectInput({ items, selectedOption, setSelectedOption, width, padding, ...rest }) {
  return (
    <Container 
      $width={width}
      $padding={padding}
      >
      <select 
        value={ selectedOption }
        onChange={(e) => setSelectedOption(e.target.value)}
        {...rest} 
      >
        {
          items.map((item, index) => (
            <option key={index} value={item.id}>
              { item.name }
            </option>
          ))
        }
      </select>
    </Container>
  );
}