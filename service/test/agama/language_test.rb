# frozen_string_literal: true

# Copyright (c) [2022] SUSE LLC
#
# All Rights Reserved.
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of version 2 of the GNU General Public License as published
# by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, contact SUSE LLC.
#
# To contact SUSE LLC about this file by physical or electronic mail, you may
# find current contact information at www.suse.com.

require_relative "../test_helper"
require "agama/language"

Yast.import "Language"

describe Agama::Language do
  subject { described_class.new(logger) }

  let(:logger) { Logger.new($stdout, level: :warn) }

  describe "#probe" do
    let(:languages) do
      {
        "en_US" => ["English (US)", "English (US)", ".UTF-8", "", "English (US)"],
        "de_DE" => ["Deutsch", "Deutsch", ".UTF-8", "@euro", "German"]
      }
    end

    before do
      allow(Yast::Language).to receive(:GetLanguagesMap).with(true).and_return(languages)
    end

    it "reads the list of languages" do
      expect(subject.languages).to be_empty
      subject.probe
      expect(subject.languages).to eq(languages)
    end
  end

  describe "#finish" do
    it "writes language settings" do
      expect(Yast::Language).to receive(:Save)
      subject.finish
    end
  end

  describe "#language=" do
    before do
      subject.probe
    end

    it "sets the language and selects the related packages" do
      expect(Yast::Language).to receive(:Set).with("de_DE")
      subject.language = "de_DE"
    end

    context "if the language is unknown" do
      it "raise an InvalidValue exception" do
        expect { subject.language = "unknown" }.to raise_error(Agama::Errors::InvalidValue)
      end
    end
  end
end
