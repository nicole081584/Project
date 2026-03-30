// app/admin/redeem.tsx 
import { useRouter } from 'expo-router'; 
import { Image, TextInput, Pressable, Alert } from 'react-native'; 
import React, { useState } from 'react'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { CameraView, useCameraPermissions } from 'expo-camera';

import ParallaxScrollView from '@/components/ParallaxScrollView'; 
import { ThemedText } from '@/components/ThemedText'; 
import { ThemedView } from '@/components/ThemedView'; 
import Footer from '@/components/Footer'; 
import ContainerStyles from '@/components/ContainerStyles'; 
import ButtonAndInputStyles from '@/components/ButtonAndInputStyles'; 
import { searchVouchers, redeemVoucher } from '@/libraries/backendService';

export default function RedeemScreen() { 
  const router = useRouter();

  const [voucherRef, setVoucherRef] = useState('');
  const [error, setError] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = React.useState("redeemHome");
  const [voucher, setVoucher] = useState<any | null>(null);
  const [partialAmount, setPartialAmount] = useState('');

  //Reset al values when going back to redeem home
  const resetScreen = () => {
  setVoucherRef('');
  setVoucher(null);
  setPartialAmount('');
  setError('');
};

  const displayValue = voucher?.adjustedValue
  ? voucher.adjustedValue
  : voucher?.value?.toString();

  // ✅ Shared validation
  const validateVoucherReference = (ref: string) => {
    const trimmedRef = ref.trim();

    if (trimmedRef.length !== 18) {
      const message =
        "The voucher reference must be exactly 18 characters long. Please check and try again.";

      setError(message);
      Alert.alert("Invalid Voucher Reference", message);
      return false;
    }

    setError('');
    return true;
  };

  const processVoucherSearch = async (ref: string) => {
  const isValid = validateVoucherReference(ref);

  if (!isValid) return;

  // 🔍 Search voucher
  const result = await searchVouchers({ reference: ref });

  if (!result || result.length === 0) {
    const message = "No voucher found with this reference. Please check and try again.";

    setError(message);
    Alert.alert("Voucher Not Found", message);
    return;
  }

  // ✅ Voucher found
    setError('');
    setVoucher(result[0]); // store first result
    setStage("voucherLoaded"); // move to next stage

    console.log("Voucher data:", result);
}

  // ✅ Manual redeem uses shared validation
  const handleManualRedeem = () => {
    processVoucherSearch(voucherRef);
  };

  // ✅ QR handler (single scan only)
  const handleQRCodeScanned = ({ data }: { data: string }) => {

  setVoucherRef(data);
  processVoucherSearch(data);
  setStage("redeemHome");
};

const handleRedeem = async (amount?: string) => {

  if (!voucher) return;

  // 🔒 Validate partial amount if provided
  if (amount !== undefined && amount.trim() === '') {
    Alert.alert("Error", "Please enter an amount.");
    return;
  }

  const result = await redeemVoucher(
    voucher.voucherNumber,
    amount
  );

  if (!result) return;

  Alert.alert(
    "Voucher Updated",
    `Remaining value: £${result.remainingValue}`
  );


    setStage("redeemHome");
    resetScreen();
  };

  return ( 
    <SafeAreaView accessible={false} style={{ flex: 1, backgroundColor: '#560324'}}> 

      {stage === "scanningQRCode" && // Show camera view for QR scanning

          <ThemedView style={{padding: 16, flex: 1}}>
            <Image 
          source={require('@/assets/images/admin.png')}
          style={ContainerStyles.titleImage}
          accessible={true}
          accessibilityLabel="Admin header image"
          />    
          
          <ThemedView style={ContainerStyles.titleContainer}> 
          <ThemedText type="title" accessibilityRole="header">
            QR-Code Scanner
          </ThemedText>  
        </ThemedView> 

          <ThemedView
            style={{ height: 400, marginTop: 20 }}
            accessible={true}
            accessibilityLabel="QR code scanner"
            accessibilityHint="Point the camera at a QR code to scan the voucher reference"
          >
            <CameraView
              style={{ flex: 1 }}
              accessible={false}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={stage === "scanningQRCode" ? handleQRCodeScanned : undefined}
            />

            <Pressable
              style={[ButtonAndInputStyles.button, { marginTop: 10 }]}
              onPress={() => setStage("redeemHome")}
              accessibilityRole="button"
              accessibilityLabel="Cancel QR scanning"
              accessibilityHint="Closes the camera and returns to manual input"
            >
              <ThemedText>Cancel Scan</ThemedText>
            </Pressable>
          </ThemedView>
          <Footer /> 
          </ThemedView>
        }

      { stage === "redeemHome" && //stage Home Screen for redeeming vouchers

      <ParallaxScrollView> 

        <Image 
          source={require('@/assets/images/admin.png')}
          style={ContainerStyles.titleImage}
          accessible={true}
          accessibilityLabel="Admin header image"
        />     

        <ThemedView style={ContainerStyles.titleContainer}> 
          <ThemedText type="title" accessibilityRole="header">
            Redeem Voucher
          </ThemedText>  
        </ThemedView> 

        {/* QR Code Button */}
        <ThemedView>
          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={async () => {
              if (!permission?.granted) {
                const result = await requestPermission();
                if (!result.granted) {
                  Alert.alert(
                    "Camera Permission Required",
                    "Camera access is needed to scan QR codes."
                  );
                  return;
                }
              }
              setStage("scanningQRCode");
            }}
            accessibilityRole="button"
            accessibilityLabel="Scan QR code"
            accessibilityHint="Opens camera to scan a voucher reference QR code. You can also enter it manually below."
          >
            <ThemedText>Scan QR Code</ThemedText>
          </Pressable>
        </ThemedView>

        {/* Manual Section */}
        <ThemedView>
          
          <ThemedText>
            Enter Voucher Reference
          </ThemedText>

          <TextInput
            style={ButtonAndInputStyles.input}
            value={voucherRef}
            onChangeText={setVoucherRef}
            placeholder="Voucher Reference"
            placeholderTextColor="#999"
            maxLength={18}
            accessibilityLabel="Voucher reference input"
            accessibilityHint="Enter the 18 character voucher reference"
          />

          {/* ✅ Accessible error */}
          {error ? (
            <ThemedText
              style={{ color: 'red' }}
              accessibilityRole="alert"
            >
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={handleManualRedeem}
            accessibilityRole="button"
            accessibilityLabel="Redeem voucher manually"
            accessibilityHint="Redeem voucher using voucher reference"
          >
            <ThemedText>Redeem Manually</ThemedText>
          </Pressable>

          <Pressable
            style={ButtonAndInputStyles.button}
            onPress={() => router.push('/admin')}
            accessibilityRole="button"
            accessibilityLabel="Back to admin home"
            accessibilityHint="Returns to the admin dashboard"
          >
            <ThemedText>← Back Admin Home</ThemedText>
          </Pressable>

        </ThemedView>

        <Footer /> 
      </ParallaxScrollView> 
  }

    {stage === "voucherLoaded" && voucher && (

  <ParallaxScrollView>

    <Image 
      source={require('@/assets/images/admin.png')}
      style={ContainerStyles.titleImage}
      accessible={false}
    />     

    <ThemedView style={ContainerStyles.titleContainer}> 
      <ThemedText type="title" accessibilityRole="header">
        Voucher Details
      </ThemedText>  
    </ThemedView> 

    {/* Voucher Info */}
    <ThemedView style={{ padding: 16 }}>

      <ThemedText type = "defaultSemiBold" style={{ textAlign: 'center', marginBottom: 20

       }}
        accessibilityLabel={`Voucher number ${voucher.voucherNumber}`}
      >
        Voucher Number: {voucher.voucherNumber}
      </ThemedText>

      <ThemedText type = "title" style={{ textAlign: 'center' }}
        accessibilityLabel={`Remaining value ${displayValue} pounds`}
      >
        Remaining Value: £{displayValue}
      </ThemedText>

    </ThemedView>

    {/* Full Redeem */}
    <ThemedView>
      <Pressable
        style={ButtonAndInputStyles.button}
        onPress={() => handleRedeem()}
        accessibilityRole="button"
        accessibilityLabel="Redeem full voucher value"
        accessibilityHint="Redeems the entire remaining value of this voucher"
        >
        <ThemedText>Redeem Full Value</ThemedText>
      </Pressable>
    </ThemedView>

    {/* Partial Redeem */}
    <ThemedView>
      
      <ThemedText>
        Enter Partial Amount
      </ThemedText>

      <TextInput
        style={ButtonAndInputStyles.input}
        value={partialAmount}
        onChangeText={setPartialAmount}
        placeholder="Amount"
        keyboardType="numeric"
        accessibilityLabel="Partial redemption amount"
        accessibilityHint="Enter an amount to deduct from the voucher"
      />

      <Pressable
        style={ButtonAndInputStyles.button}
        onPress={() => handleRedeem(partialAmount)}
        accessibilityRole="button"
        accessibilityLabel="Redeem partial voucher amount"
        accessibilityHint="Redeems only part of the voucher value"
    >
        <ThemedText>Redeem Partial Amount</ThemedText>
      </Pressable>

    </ThemedView>

    {/* Back */}
    <ThemedView>
      <Pressable
        style={ButtonAndInputStyles.button}
        onPress={() => {
          setStage("redeemHome");
          setVoucher(null);
        }}
        accessibilityRole="button"
        accessibilityLabel="Back to redeem screen"
        accessibilityHint="Returns to voucher input screen"
      >
        <ThemedText>← Back</ThemedText>
      </Pressable>
    </ThemedView>

    <Footer />

  </ParallaxScrollView>
)}
    </SafeAreaView> 
  );
}