import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useDropzone } from "react-dropzone";
import { Modal, Button, Segment } from "semantic-ui-react";
import store from "./Store";

const AddTrack = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const [deletedFiles, setDeletedFiles] = useState(new Set());

  const deleteFile = (file: File) =>
    setDeletedFiles((set) => {
      const newSet = new Set(set);
      newSet.add(file);
      return newSet;
    });

  const handleSubmit = () => {
    acceptedFiles
      .filter((file) => !deletedFiles.has(file))
      .forEach(
        async (file) =>
          await store.addTrack(
            await (file as any).text(),
            file.name.split(".")[0]
          )
      );
    setIsOpen(false);
  };

  useEffect(() => {
    acceptedFiles.forEach(deleteFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal
      trigger={
        <Button primary content="Add Tracks" onClick={() => setIsOpen(true)} />
      }
      open={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <Modal.Header>Add Track</Modal.Header>
      <Modal.Content>
        {acceptedFiles
          .filter((file) => !deletedFiles.has(file))
          .map((file) => (
            <Segment
              key={file.name}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              {file.name}
              <Button negative icon="trash" onClick={() => deleteFile(file)} />
            </Segment>
          ))}
        <div {...getRootProps()}>
          <Segment>
            <input {...getInputProps()} />
            <p>+ Drag 'n' drop some files here, or click to select files +</p>
          </Segment>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button primary content="Add selected tracks" onClick={handleSubmit} />
      </Modal.Actions>
    </Modal>
  );
};

export default observer(AddTrack);
