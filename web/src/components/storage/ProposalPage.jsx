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

import React, { useCallback, useReducer, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Alert } from "@patternfly/react-core";
import { Link } from "react-router-dom";

import { useInstallerClient } from "~/context/installer";
import { useCancellablePromise } from "~/utils";
import { Icon } from "~/components/layout";
import { Page, PageOptions } from "~/components/core";
import { ProposalActionsSection, ProposalSettingsSection } from "~/components/storage";

const initialState = {
  loading: true,
  availableDevices: [],
  volumeTemplates: [],
  settings: {},
  actions: [],
  errors: []
};

const reducer = (state, action) => {
  switch (action.type) {
    case "START_LOADING" : {
      return { ...state, loading: true };
    }

    case "STOP_LOADING" : {
      return { ...state, loading: false };
    }

    case "UPDATE_PROPOSAL": {
      const { proposal, errors } = action.payload;
      const { availableDevices, volumeTemplates, result } = proposal;
      const { candidateDevices, lvm, encryptionPassword, volumes, actions } = result;
      return {
        ...state,
        availableDevices,
        volumeTemplates,
        settings: { candidateDevices, lvm, encryptionPassword, volumes },
        actions,
        errors
      };
    }

    case "UPDATE_SETTINGS": {
      const { settings } = action.payload;
      return { ...state, settings };
    }

    default: {
      return state;
    }
  }
};

export default function ProposalPage() {
  const { storage: client } = useInstallerClient();
  const { cancellablePromise } = useCancellablePromise();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadProposal = useCallback(async (hooks = {}) => {
    flushSync(() => dispatch({ type: "START_LOADING" }));

    if (hooks.before !== undefined) await cancellablePromise(hooks.before());
    const proposal = await cancellablePromise(client.proposal.getData());
    const errors = await cancellablePromise(client.getValidationErrors());

    dispatch({ type: "UPDATE_PROPOSAL", payload: { proposal, errors } });
    dispatch({ type: "STOP_LOADING" });
  }, [client, cancellablePromise]);

  useEffect(() => {
    const probeAndLoad = async () => {
      await loadProposal({ before: () => client.probe() });
    };

    const load = async () => {
      const isDeprecated = await cancellablePromise(client.isDeprecated());
      isDeprecated ? probeAndLoad() : loadProposal();
    };

    load().catch(console.error);

    return client.onDeprecate(() => probeAndLoad());
  }, [client, cancellablePromise, loadProposal]);

  const changeSettings = async (settings) => {
    const calculateProposal = async (settings) => {
      await client.proposal.calculate(settings);
    };

    const newSettings = { ...state.settings, ...settings };

    dispatch({ type: "UPDATE_SETTINGS", payload: { settings: newSettings } });

    loadProposal({ before: () => calculateProposal(newSettings) }).catch(console.error);
  };

  const PageContent = () => {
    const validVolumeTemplates = () => {
      const volumes = state.settings.volumes || [];
      const mountPoints = volumes.map(v => v.mountPoint);
      return state.volumeTemplates.filter(t => !mountPoints.includes(t.mountPoint));
    };

    return (
      <>
        <Alert
          isInline
          customIcon={<Icon name="info" size="16" />}
          title="Devices will not be modified until installation starts."
        />
        <ProposalSettingsSection
          availableDevices={state.availableDevices}
          volumeTemplates={validVolumeTemplates()}
          settings={state.settings}
          onChange={changeSettings}
          isLoading={state.loading}
        />
        <ProposalActionsSection
          actions={state.actions}
          errors={state.errors}
          isLoading={state.loading}
        />
      </>
    );
  };

  const DASDLink = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
      client.dasd.isSupported().then(setShow);
    }, []);

    if (!show) return null;

    return (
      <Link to="/storage/dasd">
        <Icon name="settings" size="24" />
        Configure DASD
      </Link>
    );
  };

  return (
    <Page title="Storage" icon="hard_drive" actionLabel="Back" actionVariant="secondary">
      <PageContent />
      <PageOptions title="Storage">
        <DASDLink />
        <Link to="/storage/iscsi">
          <Icon name="settings" size="24" />
          Configure iSCSI
        </Link>
      </PageOptions>
    </Page>
  );
}
