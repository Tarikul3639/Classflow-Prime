// server/src/utils/change-tracker.util.ts

type FieldConfig<TEntity, TDto> = {
  dtoKey?: keyof TDto; // defaults to same key as entity field
  label: string;
  transform?: (dtoValue: any) => any; // dto value -> entity value (e.g. string -> Date)
  formatter?: (value: any) => string; // for human-readable change messages
  hideValue?: boolean; // for long/sensitive content where before/after display doesn't make sense
};

type FieldMap<TEntity, TDto> = {
  [K in keyof TEntity]?: FieldConfig<TEntity, TDto>;
};

function normalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  return value;
}

export function buildChangeTrackedUpdate<
  TEntity extends Record<string, any>,
  TDto extends Record<string, any>,
>(
  previous: TEntity,
  dto: TDto,
  fieldMap: FieldMap<TEntity, TDto>,
): { updateFields: Partial<TEntity>; changes: string[] } {
  const updateFields: Partial<TEntity> = {};
  const changes: string[] = [];

  for (const key of Object.keys(fieldMap) as (keyof TEntity)[]) {
    const config = fieldMap[key]!;
    const dtoKey = (config.dtoKey ?? key) as keyof TDto;
    const rawValue = dto[dtoKey];

    if (rawValue === undefined) continue; // field not sent, skip entirely

    const newValue = config.transform ? config.transform(rawValue) : rawValue;
    updateFields[key] = newValue;

    const prevNorm = normalize(previous[key]);
    const currNorm = normalize(newValue);

    if (JSON.stringify(prevNorm) === JSON.stringify(currNorm)) continue;

    const formatter = config.formatter ?? ((v: any) => String(v));

    if (prevNorm === null || prevNorm === '') {
      changes.push(
        config.hideValue
          ? `• ${config.label} added`
          : `• ${config.label} added: "${formatter(newValue)}"`,
      );
    } else if (currNorm === null || currNorm === '') {
      changes.push(`• ${config.label} removed`);
    } else if (config.hideValue) {
      changes.push(`• ${config.label} updated`);
    } else {
      changes.push(
        `• ${config.label} changed from "${formatter(previous[key])}" to "${formatter(newValue)}"`,
      );
    }
  }

  return { updateFields, changes };
}

// For derived values that aren't direct entity fields (e.g. a related
// collection's count, like materials attached to an update)
export function trackDerivedChange(
  label: string,
  prevValue: unknown,
  currValue: unknown,
  formatter: (v: any) => string = (v) => String(v),
): string | null {
  if (currValue === undefined) return null;
  if (JSON.stringify(prevValue) === JSON.stringify(currValue)) return null;
  return `• ${label} changed from "${formatter(prevValue)}" to "${formatter(currValue)}"`;
}