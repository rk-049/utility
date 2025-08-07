import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BusinessCalculator = () => {
  const { toast } = useToast();
  
  // State for business setup
  const [unitName, setUnitName] = useState('kg');
  const [unitPrice, setUnitPrice] = useState('300');
  const [subunitCount, setSubunitCount] = useState('10');
  
  // State for calculation
  const [calculationMode, setCalculationMode] = useState('quantityToPrice');
  const [quantityInput, setQuantityInput] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('kg');
  const [priceInput, setPriceInput] = useState('');
  const [discountInput, setDiscountInput] = useState('0');
  
  // State for results
  const [result, setResult] = useState('');
  const [calculationDetails, setCalculationDetails] = useState('');

  const unitConversions = {
    kg: ['kg', 'gm', 'tonne'],
    litre: ['litre', 'ml'],
    strip: ['strip', 'tablet'],
    piece: ['piece']
  };

  // Load saved settings on component mount
  useEffect(() => {
    const savedUnit = localStorage.getItem('unitName') || 'kg';
    const savedPrice = localStorage.getItem('unitPrice') || '300';
    const savedSubunit = localStorage.getItem('subunitCount') || '10';
    
    setUnitName(savedUnit);
    setUnitPrice(savedPrice);
    setSubunitCount(savedSubunit);
    setQuantityUnit(savedUnit);
  }, []);

  // Update quantity unit options when unit name changes
  useEffect(() => {
    const availableUnits = unitConversions[unitName as keyof typeof unitConversions];
    if (availableUnits && !availableUnits.includes(quantityUnit)) {
      setQuantityUnit(availableUnits[0]);
    }
  }, [unitName, quantityUnit]);

  const saveSettings = () => {
    localStorage.setItem('unitName', unitName);
    localStorage.setItem('unitPrice', unitPrice);
    localStorage.setItem('subunitCount', subunitCount);
    
    toast({
      title: "Settings Saved",
      description: "Your calculator settings have been saved successfully.",
    });
  };

  const calculate = () => {
    const baseUnitPrice = parseFloat(unitPrice);
    const subunitValue = parseInt(subunitCount);
    const discount = parseFloat(discountInput || '0');

    if (isNaN(baseUnitPrice)) {
      toast({
        variant: "destructive",
        title: "Invalid Price",
        description: "Please enter a valid unit price.",
      });
      return;
    }

    let resultText = '';
    let detailsText = '';

    if (calculationMode === 'quantityToPrice') {
      const qty = parseFloat(quantityInput);
      if (isNaN(qty)) {
        toast({
          variant: "destructive",
          title: "Invalid Quantity",
          description: "Please enter a valid quantity.",
        });
        return;
      }

      let baseQty = qty;

      // Convert to base unit
      if (unitName === 'kg' && quantityUnit === 'gm') baseQty = qty / 1000;
      if (unitName === 'kg' && quantityUnit === 'tonne') baseQty = qty * 1000;
      if (unitName === 'litre' && quantityUnit === 'ml') baseQty = qty / 1000;
      if (unitName === 'strip' && quantityUnit === 'tablet') baseQty = qty / subunitValue;

      let price = baseQty * baseUnitPrice;
      const discountAmt = price * discount / 100;
      const finalPrice = price - discountAmt;

      resultText = `₹${finalPrice.toFixed(2)}`;
      detailsText = `${baseQty.toFixed(4)} ${unitName} × ₹${baseUnitPrice} = ₹${price.toFixed(2)}`;
      if (discount > 0) {
        detailsText += `\nDiscount: ₹${discountAmt.toFixed(2)} (${discount}%)`;
      }
    } else {
      const inputPrice = parseFloat(priceInput);
      if (isNaN(inputPrice)) {
        toast({
          variant: "destructive",
          title: "Invalid Price",
          description: "Please enter a valid price.",
        });
        return;
      }

      const basePrice = inputPrice / (1 - discount / 100);
      let qty = basePrice / baseUnitPrice;
      let displayQty = qty;

      if (unitName === 'kg' && quantityUnit === 'gm') displayQty = qty * 1000;
      if (unitName === 'kg' && quantityUnit === 'tonne') displayQty = qty / 1000;
      if (unitName === 'litre' && quantityUnit === 'ml') displayQty = qty * 1000;
      if (unitName === 'strip' && quantityUnit === 'tablet') displayQty = qty * subunitValue;

      resultText = `${displayQty.toFixed(4)} ${quantityUnit}`;
      detailsText = `₹${inputPrice} → Effective: ₹${basePrice.toFixed(2)}`;
      detailsText += `\nQty = ₹${basePrice.toFixed(2)} ÷ ₹${baseUnitPrice} = ${qty.toFixed(4)} ${unitName}`;
    }

    setResult(resultText);
    setCalculationDetails(detailsText);
  };

  const clearResults = () => {
    setResult('');
    setCalculationDetails('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Calculator className="w-8 h-8 text-primary" />
          Business Calculator
        </h1>
        <p className="text-muted-foreground">Elegant utility calculator for business calculations</p>
      </div>

      {/* Business Setup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            Business Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unit-name">Unit Name</Label>
            <Select value={unitName} onValueChange={(value) => {
              setUnitName(value);
              clearResults();
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                <SelectItem value="litre">Litre</SelectItem>
                <SelectItem value="strip">Strip (Medical)</SelectItem>
                <SelectItem value="piece">Piece</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit-price">Base Price per Unit (₹)</Label>
            <Input
              id="unit-price"
              type="number"
              value={unitPrice}
              onChange={(e) => {
                setUnitPrice(e.target.value);
                clearResults();
              }}
              placeholder="300"
            />
          </div>

          {unitName === 'strip' && (
            <div className="space-y-2">
              <Label htmlFor="subunit-count">Tablets per Strip</Label>
              <Input
                id="subunit-count"
                type="number"
                value={subunitCount}
                onChange={(e) => {
                  setSubunitCount(e.target.value);
                  clearResults();
                }}
                placeholder="10"
              />
            </div>
          )}

          <Button onClick={saveSettings} variant="outline" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Calculation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calculation Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={calculationMode}
            onValueChange={(value) => {
              setCalculationMode(value);
              clearResults();
            }}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quantityToPrice" id="qty-to-price" />
              <Label htmlFor="qty-to-price" className="flex items-center gap-2 cursor-pointer">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Quantity → Price
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="priceToQuantity" id="price-to-qty" />
              <Label htmlFor="price-to-qty" className="flex items-center gap-2 cursor-pointer">
                <TrendingDown className="w-4 h-4 text-blue-600" />
                Price → Quantity
              </Label>
            </div>
          </RadioGroup>

          {calculationMode === 'quantityToPrice' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantityInput}
                  onChange={(e) => {
                    setQuantityInput(e.target.value);
                    clearResults();
                  }}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity-unit">Unit</Label>
                <Select value={quantityUnit} onValueChange={(value) => {
                  setQuantityUnit(value);
                  clearResults();
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitConversions[unitName as keyof typeof unitConversions]?.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value);
                  clearResults();
                }}
                placeholder="Enter price"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              value={discountInput}
              onChange={(e) => {
                setDiscountInput(e.target.value);
                clearResults();
              }}
              placeholder="0"
            />
          </div>

          <Button onClick={calculate} className="w-full">
            <Calculator className="w-4 h-4 mr-2" />
            Calculate
          </Button>

          {result && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {calculationMode === 'quantityToPrice' ? 'Final Price' : 'Quantity'}
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {result}
                </div>
              </div>
              
              {calculationDetails && (
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {calculationDetails}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessCalculator;