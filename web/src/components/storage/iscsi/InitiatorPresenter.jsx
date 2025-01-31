/*
 * Copyright (c) [2023] SUSE LLC
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
import { Skeleton } from "@patternfly/react-core";
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';

import { RowActions } from '~/components/core';
import { InitiatorForm } from "~/components/storage/iscsi";

export default function InitiatorPresenter({ initiator, client }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setIsLoading(initiator === undefined);
  }, [initiator]);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);
  const submitForm = async (data) => {
    await client.iscsi.setInitiatorName(data.name);

    setIsLoading(true);
    closeForm();
  };

  const initiatorActions = () => {
    const actions = {
      edit: { title: "Edit", onClick: openForm }
    };

    return [actions.edit];
  };

  const Content = () => {
    if (isLoading) {
      return (
        <Tr>
          <Td colSpan={4}>
            <Skeleton />
          </Td>
        </Tr>
      );
    }

    return (
      <Tr>
        <Td dataLabel="Name">{initiator.name}</Td>
        <Td dataLabel="iBFT">{initiator.ibft ? "Yes" : "No"}</Td>
        <Td dataLabel="Offload card">{initiator.offloadCard || "None"}</Td>
        <Td isActionCell>
          <RowActions actions={initiatorActions()} id="actions-for-initiator" />
        </Td>
      </Tr>
    );
  };

  return (
    <>
      <TableComposable variant="compact">
        <Thead>
          <Tr>
            <Th width={50}>Name</Th>
            <Th>iBFT</Th>
            <Th>Offload card</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          <Content />
        </Tbody>
      </TableComposable>
      { isFormOpen &&
        <InitiatorForm
          initiator={initiator}
          onSubmit={submitForm}
          onCancel={closeForm}
        /> }
    </>
  );
}
