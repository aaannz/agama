/*
 * Copyright (c) [2022-2023] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import React, { useEffect, useState } from "react";
import {
  Button,
  Form, FormGroup, FormSelect, FormSelectOption, Skeleton, Switch,
  Tooltip
} from "@patternfly/react-core";

import { If, PasswordAndConfirmationInput, Section, Sidebar, Popup } from "~/components/core";
import { ProposalVolumes } from "~/components/storage";
import { Icon } from "~/components/layout";
import { noop } from "~/utils";

const BootDeviceForm = ({ id, current, devices, onSubmit }) => {
  const [device, setDevice] = useState(current);

  useEffect(() => {
    const isCurrentValid = () => {
      return devices.find(d => d.id === current) !== undefined;
    };

    if (!isCurrentValid()) setDevice(devices[0]?.id);
  }, [current, devices]);

  const submitForm = (e) => {
    e.preventDefault();
    if (device !== undefined) onSubmit(device);
  };

  const changeDevice = (v) => setDevice(v);

  const DeviceSelector = ({ current, devices, onChange }) => {
    const DeviceOptions = () => {
      const options = devices.map(device => {
        return <FormSelectOption key={device.id} value={device.id} label={device.label} />;
      });

      return options;
    };

    return (
      <FormGroup fieldId="bootDevice" label="Device to use for the installation">
        <FormSelect
          id="bootDevice"
          value={current}
          aria-label="Device"
          onChange={onChange}
        >
          <DeviceOptions />
        </FormSelect>
      </FormGroup>
    );
  };

  return (
    <Form id={id} onSubmit={submitForm}>
      <DeviceSelector
        key={device}
        current={device}
        devices={devices}
        onChange={changeDevice}
      />
    </Form>
  );
};

const BootDeviceField = ({ current, devices, onChange, isLoading }) => {
  const [device, setDevice] = useState(current);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => setIsFormOpen(true);

  const closeForm = () => setIsFormOpen(false);

  const acceptForm = (newDevice) => {
    closeForm();
    setDevice(newDevice);
    onChange(newDevice);
  };

  const BootDeviceContent = ({ device }) => {
    const text = device || "No device selected yet";

    return <Button variant="link" isInline onClick={openForm}>{text}</Button>;
  };

  const SidebarLink = ({ label }) => {
    return (
      <Sidebar.OpenButton onClick={closeForm}>
        {label}
      </Sidebar.OpenButton>
    );
  };

  if (isLoading) {
    return <Skeleton width="25%" />;
  }

  return (
    <>
      <div className="split">
        <span>Installation device</span>
        <BootDeviceContent device={device} />
      </div>
      <Popup
        aria-label="Installation device"
        title="Installation device"
        isOpen={isFormOpen}
      >
        <div className="flex-stack">
          <If
            condition={devices.length === 0}
            then={<div className="bold">No devices found</div>}
            else={
              <BootDeviceForm
                id="bootDeviceForm"
                current={device}
                devices={devices}
                onSubmit={acceptForm}
              />
            }
          />
          <p>
            Use the <SidebarLink label="advanced options menu" /> to configure access to more disks.
          </p>
        </div>
        <Popup.Actions>
          <Popup.Confirm
            form="bootDeviceForm"
            type="submit"
            isDisabled={devices.length === 0}
          >
            Accept
          </Popup.Confirm>
          <Popup.Cancel onClick={closeForm} />
        </Popup.Actions>
      </Popup>
    </>
  );
};

const LVMField = ({ selected: selectedProp, onChange, isLoading }) => {
  const [selected, setSelected] = useState(selectedProp);

  const changeSelected = (value) => {
    setSelected(value);
    onChange(value);
  };

  if (isLoading) return <Skeleton width="25%" />;

  return (
    <Switch
      id="lvm"
      label="Use logical volume management (LVM)"
      isReversed
      isChecked={selected}
      onChange={changeSelected}
    />
  );
};

const EncryptionPasswordForm = ({ id, password: passwordProp, onSubmit, onValidate }) => {
  const [password, setPassword] = useState(passwordProp || "");

  useEffect(() => {
    if (password.length === 0) onValidate(false);
  }, [password, onValidate]);

  const changePassword = (v) => setPassword(v);

  const submitForm = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <Form id={id} onSubmit={submitForm}>
      <PasswordAndConfirmationInput
        id="encryptionPasswordInput"
        value={password}
        onChange={changePassword}
        onValidation={onValidate}
      />
    </Form>
  );
};

const EncryptionPasswordField = ({ selected: selectedProp, password: passwordProp, onChange, isLoading }) => {
  const [selected, setSelected] = useState(selectedProp || false);
  const [password, setPassword] = useState(passwordProp || "");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  const openForm = () => setIsFormOpen(true);

  const closeForm = () => setIsFormOpen(false);

  const acceptForm = (newPassword) => {
    closeForm();
    setPassword(newPassword);
    onChange({ selected, password: newPassword });
  };

  const cancelForm = () => {
    closeForm();
    if (password.length === 0) setSelected(false);
  };

  const validateForm = (valid) => setIsFormValid(valid);

  const changeSelected = (value) => {
    setSelected(value);

    if (value && password.length === 0) openForm();

    if (!value) {
      setPassword("");
      onChange({ selected: false, password: "" });
    }
  };

  const ChangePasswordButton = () => {
    return (
      <Tooltip
        content="Change encryption password"
        entryDelay={400}
        exitDelay={50}
        position="right"
      >
        <button aria-label="Encryption settings" className="plain-control" onClick={openForm}>
          <Icon name="tune" size={24} />
        </button>
      </Tooltip>
    );
  };

  if (isLoading) return <Skeleton width="25%" />;

  return (
    <>
      <div className="split">
        <Switch
          id="encryption"
          label="Encrypt devices"
          isReversed
          isChecked={selected}
          onChange={changeSelected}
        />
        { selected && <ChangePasswordButton /> }
      </div>
      <Popup aria-label="Devices encryption" title="Devices encryption" isOpen={isFormOpen}>
        <EncryptionPasswordForm
          id="encryptionPasswordForm"
          password={password}
          onSubmit={acceptForm}
          onValidate={validateForm}
        />
        <Popup.Actions>
          <Popup.Confirm form="encryptionPasswordForm" type="submit" isDisabled={!isFormValid}>Accept</Popup.Confirm>
          <Popup.Cancel onClick={cancelForm} />
        </Popup.Actions>
      </Popup>
    </>
  );
};

/**
 * Section for editing the proposal settings
 * @component
 *
 * @param {object} props
 * @param {object[]} [props.availableDevices=[]]
 * @param {object[]} [props.volumeTemplates=[]]
 * @param {object} [props.settings={}]
 * @param {onChangeFn} [props.onChange=noop]
 * @param {boolean} [isLoading=false]
 *
 * @callback onChangeFn
 * @param {object} settings
 */
export default function ProposalSettingsSection({
  availableDevices = [],
  volumeTemplates = [],
  settings = {},
  onChange = noop,
  isLoading = false
}) {
  const changeBootDevice = (device) => {
    onChange({ candidateDevices: [device] });
  };

  const changeLVM = (lvm) => {
    onChange({ lvm });
  };

  const changeEncryption = ({ password: encryptionPassword }) => {
    onChange({ encryptionPassword });
  };

  const changeVolumes = (volumes) => {
    onChange({ volumes });
  };

  const bootDevice = (settings.candidateDevices || [])[0];
  const encryption = settings.encryptionPassword !== undefined && settings.encryptionPassword.length > 0;

  return (
    <Section title="Settings" className="flex-stack">
      <BootDeviceField
        current={bootDevice}
        devices={availableDevices}
        onChange={changeBootDevice}
        isLoading={isLoading && bootDevice === undefined}
      />
      <LVMField
        selected={settings.lvm === true}
        onChange={changeLVM}
        isLoading={settings.lvm === undefined}
      />
      <EncryptionPasswordField
        selected={encryption}
        password={settings.encryptionPassword}
        onChange={changeEncryption}
        isLoading={settings.encryptionPassword === undefined}
      />
      <ProposalVolumes
        volumes={settings.volumes || []}
        templates={volumeTemplates}
        onChange={changeVolumes}
        isLoading={isLoading}
      />
    </Section>
  );
}
