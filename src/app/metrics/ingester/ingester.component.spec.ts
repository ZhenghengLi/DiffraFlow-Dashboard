import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngesterComponent } from './ingester.component';

describe('IngesterComponent', () => {
  let component: IngesterComponent;
  let fixture: ComponentFixture<IngesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngesterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IngesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
