/**
 * Copyright 2020, Verizon Media.
 * Licensed under the Apache License, Version 2.0. See accompanying LICENSE file for terms.
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const DATA_LOOKBACK = 30;

export default class ChartContainerComponent extends Component {
  @service elide;
  @tracked records;
  @tracked showModal;
  @tracked modalChart;

  //feature flag bar chart
  showBarChart = false;

  @action
  fetchData() {
    const { location } = this.args;
    if (location) {
      this.fetchRecords.perform(location, this.lookbackDate);
    }
  }

  get lookbackDate() {
    const d = new Date();
    d.setDate(d.getDate()-DATA_LOOKBACK);
    let year = d.getFullYear(),
          month = d.getMonth(),
          date = d.getDate();

    month = month > 10 ? month : `0${month}`;
    date = date > 10 ? date : `0${date}`;
    return `${year}-${month}-${date}T00:00Z`;
  }

  @(task(function* (location, lookbackDate) {
    const records = yield this.elide.fetch.linked().perform('healthRecords', {
      eq: { wikiId: location.attributes.wikiId },
      ge: { referenceDate: [lookbackDate] },
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

  @action
  showModalFor(chartType) {
    this.showModal = true;
    this.modalChart = chartType;
  }
}
