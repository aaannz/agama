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

import React, { useState } from "react";
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';

import { RowActions } from '~/components/core';
import { EditNodeForm, LoginForm, NodeStartupOptions } from "~/components/storage/iscsi";

export default function NodesPresenter ({ nodes, client }) {
  const [currentNode, setCurrentNode] = useState();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);

  const openLoginForm = (node) => {
    setCurrentNode(node);
    setIsLoginFormOpen(true);
  };

  const closeLoginForm = () => setIsLoginFormOpen(false);

  const submitLoginForm = async (options) => {
    const result = await client.iscsi.login(currentNode, options);
    if (result === 0) closeLoginForm();

    return result;
  };

  const openEditForm = (node) => {
    setCurrentNode(node);
    setIsEditFormOpen(true);
  };

  const closeEditForm = () => setIsEditFormOpen(false);

  const submitEditForm = async (data) => {
    await client.iscsi.setStartup(currentNode, data.startup);
    closeEditForm();
  };

  const nodeStatus = (node) => {
    if (!node.connected) return "Disconnected";

    const startup = Object.values(NodeStartupOptions).find(o => o.value === node.startup);
    return `Connected (${startup.label})`;
  };

  const nodeActions = (node) => {
    const actions = {
      edit: {
        title: "Edit",
        onClick: () => openEditForm(node)
      },
      delete: {
        title: "Delete",
        onClick: () => client.iscsi.delete(node),
        className: "danger-action"
      },
      login: {
        title: "Login",
        onClick: () => openLoginForm(node)
      },
      logout: {
        title: "Logout",
        onClick: () => client.iscsi.logout(node)
      }
    };

    if (node.connected)
      return [actions.edit, actions.logout];
    else
      return [actions.login, actions.delete];
  };

  const NodeRow = ({ node }) => {
    return (
      <Tr>
        <Td dataLabel="Name">{node.target}</Td>
        <Td dataLabel="Portal">{node.address + ":" + node.port}</Td>
        <Td dataLabel="Interface">{node.interface}</Td>
        <Td dataLabel="iBFT">{node.ibft ? "Yes" : "No"}</Td>
        <Td dataLabel="Status">{nodeStatus(node)}</Td>
        <Td isActionCell>
          <RowActions actions={nodeActions(node)} id={`actions-for-node${node.id}`} />
        </Td>
      </Tr>
    );
  };

  const Content = () => {
    return nodes.map(n => <NodeRow node={n} key={`node${n.id}`} />);
  };

  return (
    <>
      <TableComposable variant="compact">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Portal</Th>
            <Th>Interface</Th>
            <Th>iBFT</Th>
            <Th>Status</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          <Content />
        </Tbody>
      </TableComposable>
      { isLoginFormOpen &&
        <LoginForm
          node={currentNode}
          onSubmit={submitLoginForm}
          onCancel={closeLoginForm}
        /> }
      { isEditFormOpen &&
        <EditNodeForm
          node={currentNode}
          onSubmit={submitEditForm}
          onCancel={closeEditForm}
        /> }
    </>
  );
}
