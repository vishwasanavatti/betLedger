import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../services/storage.service';
import { Ledger, currency, ratio } from '../../model/bet-form.model';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.page.html',
  styleUrls: ['./fixture.page.scss'],
})
export class FixturePage implements OnInit {
  fixtures: any;
  searchValue: string;
  filterItems: any;

  // bad coding fix later
  rat: number;
  amt: number;
  currencies: any;
  ratType: any;

  constructor(
    private navController: NavController,
    private http: HttpClient,
    private storage: StorageService,
    private toastController: ToastController
  ) {
    this.currencies = currency;
    this.ratType = ratio;
  }

  betData: Ledger = {
    id: null,
    matchNumber: null,
    teamFor: '',
    teamAgainst: '',
    date: '',
    ratioType: '',
    ratioValue: null,
    amount: null,
    isActive: false,
    result: '',
    currency: '',
    resultAmt: null,
  };

  ngOnInit() {
    const json = require('../../../assets/fixtures.json');
    this.fixtures = json.fixtures;
    this.filterItems = this.fixtures;
    this.http
      .get(
        'https://cors-anywhere.herokuapp.com/https://cricapi.com/api/matches/?apikey=yJMDk1hYBZYZ92CVYtQzJb65oRq1'
      )
      .subscribe((response) => {
        // this.setFixture(response);
      });
  }

  setFixture(data: any): void {
    this.fixtures = data.matches.filter((x) => x.type === 'Twenty20');
    console.log(this.fixtures);
    // this.filterItems = this.fixtures;
  }

  search(): void {
    if (this.searchValue && this.searchValue.trim() !== ' ') {
      this.filterItems = this.fixtures.filter(
        (item) =>
          item.team1
            .toLowerCase()
            .indexOf(this.searchValue.toLowerCase().trim()) > -1 ||
          item.team2
            .toLowerCase()
            .indexOf(this.searchValue.toLowerCase().trim()) > -1 ||
          item.date
            .toLowerCase()
            .indexOf(this.searchValue.toLowerCase().trim()) > -1
      );
    } else {
      this.filterItems = this.fixtures;
    }
  }

  expand(data: any): void {
    this.betData = {
      id: null,
      matchNumber: null,
      teamFor: '',
      teamAgainst: '',
      date: '',
      ratioType: '',
      ratioValue: null,
      amount: null,
      isActive: false,
      result: '',
      currency: '',
      resultAmt: null,
    };
    this.rat = null;
    this.amt = null;

    if (data.expanded) {
      data.expanded = false;
    } else {
      this.filterItems.map((item) => {
        if (item === data) {
          item.expanded = !item.expanded;
        } else {
          item.expanded = false;
        }
      });
    }
  }

  addBet(data: any, i: number): void {
    this.betData.isActive = true;
    this.betData.date = data.date;
    this.betData.matchNumber = i + 1;
    this.betData.ratioValue = this.rat;
    this.betData.amount = this.amt;
    if (this.betData.teamFor === data.team1) {
      this.betData.teamAgainst = data.team2;
    } else {
      this.betData.teamAgainst = data.team1;
    }
    this.storage.getNextId().then((key) => {
      this.betData.id = key;
      this.storage.addBet(this.betData.id.toString(), this.betData);
      this.betPlaceAlert();
    });
  }

  async betPlaceAlert(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'bet added successfully',
      color: 'success',
      position: 'bottom',
      duration: 1000,
    });
    toast.present();
  }

  goBack() {
    this.navController.navigateRoot('/home');
  }
}
