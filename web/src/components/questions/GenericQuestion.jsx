/*
 * Copyright (c) [2022] SUSE LLC
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

import React from "react";
import { Text } from "@patternfly/react-core";
import { Popup } from "~/components/core";
import { QuestionActions } from "~/components/questions";

export default function GenericQuestion({ question, answerCallback }) {
  const actionCallback = (option) => {
    question.answer = option;
    answerCallback(question);
  };

  return (
    <Popup isOpen aria-label="Question">
      <Text>
        { question.text }
      </Text>
      <Popup.Actions>
        <QuestionActions
          actions={question.options}
          defaultAction={question.defaultOption}
          actionCallback={actionCallback}
        />
      </Popup.Actions>
    </Popup>
  );
}
