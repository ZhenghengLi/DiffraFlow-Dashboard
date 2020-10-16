import { TestBed } from '@angular/core/testing';

import { MetricsDataService } from './metrics-data.service';

describe('MetricsDataService', () => {
    let service: MetricsDataService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MetricsDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
