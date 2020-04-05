import React, { useState } from "react";
import { observer } from "mobx-react";
import { useDropzone } from "react-dropzone";
import { Modal, Button, Segment } from "semantic-ui-react";
import store from "./Store";

const AddTrack = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  const handleSubmit = () => {
    acceptedFiles.forEach(
      async (file) => await store.addTrack(await (file as any).text())
    );
    setIsOpen(false);
  };

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
          <Segment>{file.name}</Segment>
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
