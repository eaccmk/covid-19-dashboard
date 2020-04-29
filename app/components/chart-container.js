/**
 * Copyright 2020, Verizon Media.
 * Licensed under the Apache License, Version 2.0. See accompanying LICENSE file for terms.
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ChartContainerComponent extends Component {
  @service elide;
  @tracked records;

  @action
  fetchData() {
    const { location } = this.args;
    if (location) {
      this.fetchRecords.perform(location);
    }
  }

  @(task(function* (location) {
    const records = yield this.elide.fetch.perform('healthRecords', {
      eq: { wikiId: location.attributes.wikiId },
      fields: {
        healthRecords: [
          'referenceDate',
          'totalConfirmedCases',
          'totalDeaths',
          'numActiveCases',
          'numDeaths',
          'numRecoveredCases'
        ]
      }
    });

    this.records = records;
  }).restartable())
  fetchRecords;
}
