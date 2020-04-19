import React, { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useDropzone } from "react-dropzone";
import { Modal, Button, Segment } from "semantic-ui-react";
import store from "./Store";

const AddTrack = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);

  const onDrop = (newFiles: File[]) => {
    setAcceptedFiles((files) => [...files, ...newFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop,
    accept: ".gpx",
  });

  const deleteFile = (file: File) =>
    setAcceptedFiles((files) => files.filter((f) => f !== file));

  const handleSubmit = () => {
    acceptedFiles.forEach(
      async (file) =>
        await store.addTrack(
          await (file as any).text(),
          file.name.split(".")[0]
        )
    );
    setAcceptedFiles([]);
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
        {acceptedFiles.map((file) => (
          <Segment
            key={file.name}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            {file.name}
            <Button negative icon="trash" onClick={() => deleteFile(file)} />
          </Segment>
        ))}
        <Segment {...(getRootProps() as any)}>
          <input {...getInputProps()} />
          <p>Click here to select your .gpx track records.</p>
        </Segment>
      </Modal.Content>
      <Modal.Actions>
        <Button primary content="Add selected tracks" onClick={handleSubmit} />
      </Modal.Actions>
    </Modal>
  );
};

export default observer(AddTrack);
