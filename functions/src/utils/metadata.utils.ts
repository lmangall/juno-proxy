export const metadataEmail = (metadata: [string, string][]): string =>
  metadataKey({metadata, key: "email"});

export const metadataName = (metadata: [string, string][]): string =>
    metadataKey({metadata, key: "name"});

const metadataKey = ({
  metadata,
  key,
}: {
  metadata: [string, string][];
  key: string;
}): string => new Map(metadata).get(key) ?? "";
