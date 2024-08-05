import React from 'react';

import type { AnyPlatePlugin } from '../../shared/types/plugin/PlatePlugin';

import { type PlateId, useEditorRef, usePlateSelectors } from '../stores';

export function EditorRefPluginEffect({
  id,
  plugin,
}: {
  id?: PlateId;
  plugin: AnyPlatePlugin;
}) {
  const editor = useEditorRef(id);

  plugin.useHooks?.({ editor, plugin });

  return null;
}

export function EditorRefEffect({ id }: { id?: PlateId }) {
  const editor = usePlateSelectors(id).editor();

  return (
    <>
      {editor.plugins.map((plugin) => (
        <EditorRefPluginEffect id={id} key={plugin.key} plugin={plugin} />
      ))}
    </>
  );
}
