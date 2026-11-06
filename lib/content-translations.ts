export type EditableSection =
  | "hero"
  | "about"
  | "spec"
  | "beforeAfter"
  | "gallery"
  | "appt"
  | "contact"
  | "footer"
  | "brand"
  | "nav"
  | "chat"
  | "base";

export type LocalizedSectionOverrides = {
  en: Record<string, string>;
  bn: Record<string, string>;
};

export type PublishedSectionOverrides = Partial<
  Record<EditableSection, LocalizedSectionOverrides>
>;

export function flattenStrings(
  value: unknown,
  prefix = "",
): Record<string, string> {
  if (typeof value === "string") return prefix ? { [prefix]: value } : {};
  if (Array.isArray(value)) {
    return value.reduce<Record<string, string>>((result, item, index) => {
      Object.assign(result, flattenStrings(item, `${prefix}.${index}`));
      return result;
    }, {});
  }
  if (value && typeof value === "object") {
    return Object.entries(value).reduce<Record<string, string>>(
      (result, [key, nestedValue]) => {
        Object.assign(
          result,
          flattenStrings(nestedValue, prefix ? `${prefix}.${key}` : key),
        );
        return result;
      },
      {},
    );
  }
  return {};
}

function replaceStringAtPath(
  value: unknown,
  path: string[],
  replacement: string,
): unknown {
  if (path.length === 0) return typeof value === "string" ? replacement : value;

  const [segment, ...rest] = path;

  if (Array.isArray(value)) {
    const index = Number(segment);
    if (!Number.isInteger(index) || index < 0 || index >= value.length) {
      return value;
    }

    const result = [...value];
    result[index] = replaceStringAtPath(result[index], rest, replacement);
    return result;
  }

  if (value && typeof value === "object" && segment in value) {
    const record = value as Record<string, unknown>;
    return {
      ...record,
      [segment]: replaceStringAtPath(record[segment], rest, replacement),
    };
  }

  return value;
}

export function applySectionOverrides<T>(
  base: T,
  values: Record<string, string> | undefined,
): T {
  if (!values) return base;

  return Object.entries(values).reduce<unknown>(
    (result, [path, replacement]) =>
      replaceStringAtPath(result, path.split("."), replacement),
    base,
  ) as T;
}
